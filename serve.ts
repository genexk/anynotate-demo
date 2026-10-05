// Static server for site/ with live reload. No dependencies: `bun serve.ts`.
// Binds to 127.0.0.1 only. PORT overrides the default 5173.
import { watch } from "node:fs";
import { join, normalize, resolve, sep } from "node:path";

const root = resolve(import.meta.dir, "site");
const port = Number(process.env.PORT ?? 5173);
const bootId = crypto.randomUUID();
const encoder = new TextEncoder();
const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

// Injected into HTML responses only, so the files in site/ stay free of dev tooling.
// After a server restart the boot id changes and the page reloads itself.
const reloadSnippet = `<script>
(() => {
  let boot = null;
  const es = new EventSource("/__livereload");
  es.addEventListener("hello", (e) => { if (boot && boot !== e.data) location.reload(); boot = e.data; });
  es.addEventListener("reload", () => location.reload());
})();
</script>`;

function send(controller: ReadableStreamDefaultController<Uint8Array>, chunk: string): boolean {
  try {
    controller.enqueue(encoder.encode(chunk));
    return true;
  } catch {
    clients.delete(controller);
    return false;
  }
}

function broadcast(event: string) {
  for (const c of clients) send(c, `event: ${event}\ndata: ${Date.now()}\n\n`);
}

let timer: ReturnType<typeof setTimeout> | undefined;
watch(root, { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => broadcast("reload"), 80);
});

setInterval(() => {
  for (const c of clients) send(c, ": ping\n\n");
}, 15_000);

function events(): Response {
  let self: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      self = controller;
      clients.add(controller);
      send(controller, `retry: 500\nevent: hello\ndata: ${bootId}\n\n`);
    },
    cancel() {
      clients.delete(self);
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" },
  });
}

async function file(pathname: string): Promise<Response> {
  let rel: string;
  try {
    rel = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  let path = resolve(root, rel);
  if (path !== root && !path.startsWith(root + sep)) return new Response("Not found", { status: 404 });
  if (path === root || pathname.endsWith("/")) path = join(path, "index.html");

  const f = Bun.file(path);
  if (!(await f.exists())) return new Response("Not found", { status: 404 });
  const headers = { "content-type": f.type, "cache-control": "no-store" };
  if (path.endsWith(".html")) {
    const html = (await f.text()).replace("</body>", `${reloadSnippet}\n</body>`);
    return new Response(html, { headers });
  }
  return new Response(f, { headers });
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  idleTimeout: 0,
  fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === "/__livereload") return events();
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    return file(pathname);
  },
});

console.log(`Serving site/ at http://localhost:${server.port}/ with live reload. Ctrl+C to stop.`);
