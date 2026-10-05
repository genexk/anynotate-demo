# Anynotate demo: tomato soup

A tiny recipe page for showing [Anynotate](https://github.com/genexk/anynotate): you leave notes on the page in Chrome, send them to your AI coding agent, and watch the page update.

The page has a few small things wrong with it on purpose. The presenter guide in [anynotate-demo-kit](https://github.com/genexk/anynotate-demo-kit) walks through them one by one, with the exact notes to type.

The `main` branch is always the starting state. GitHub Pages publishes it as a preview, but for the demo you run it locally so the agent's edits show up live.

## Run it

```bash
git clone https://github.com/genexk/anynotate-demo.git ~/anynotate-demo
cd ~/anynotate-demo
./serve
```

Open http://localhost:5173. The page reloads by itself whenever a file in `site/` changes.

- `./serve` uses [bun](https://bun.sh) when it is installed (live reload) and falls back to `python3 -m http.server` (no live reload; refresh by hand).
- On Windows, run `bun serve.ts`, or `python -m http.server 5173 --bind 127.0.0.1 --directory site`.
- `PORT=5174 ./serve` picks another port.

Start your agent (Claude Code, Codex, or any other) in this folder so it can edit the files.

## Start over

```bash
git reset --hard origin/main && git clean -fd
```

The kit's `scripts/reset.sh` does the same, restarts the server and removes this page's notes from the Anynotate inbox.

## Files

| Path | What it is |
| --- | --- |
| `site/` | The page: `index.html`, `style.css`, `app.js` |
| `serve`, `serve.ts` | Local server with live reload, no dependencies |
| `CLAUDE.md`, `AGENTS.md` | House rules for the agent: small edits, no new dependencies |
| `.anynotate-demo` | Marker the kit's scripts check before they reset anything |

## License

MIT
