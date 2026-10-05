const BASE_SERVINGS = 4;

const servingsBadge = document.getElementById("servings-badge");
const servingButtons = document.querySelectorAll("[data-servings]");
const amounts = document.querySelectorAll("#ingredients [data-qty]");

function formatAmount(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function setServings(servings) {
  servingsBadge.textContent = `Serves ${servings}`;
  for (const button of servingButtons) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.servings) === servings));
  }
  for (const el of amounts) {
    el.textContent = formatAmount((Number(el.dataset.qty) * servings) / BASE_SERVINGS);
  }
}

for (const button of servingButtons) {
  button.addEventListener("click", () => setServings(Number(button.dataset.servings)));
}

document.getElementById("print").addEventListener("click", () => window.print());

const save = document.getElementById("save-recipe");
save.addEventListener("click", () => {
  const saved = save.getAttribute("aria-pressed") !== "true";
  save.setAttribute("aria-pressed", String(saved));
  save.textContent = saved ? "Saved" : "Save recipe";
});
