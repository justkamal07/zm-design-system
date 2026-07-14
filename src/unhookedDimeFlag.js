const DISMISS_KEY = "zenmode-unhooked-dime-dismissed";

export function unhookedDimeFlag() {
  return `
    <aside class="unhooked-flag" data-unhooked-dime-flag aria-label="Unhooked Dime interactive thesis">
      <div class="unhooked-flag-panel" data-unhooked-dime-card role="group" tabindex="0" aria-labelledby="unhooked-dime-title">
        <button class="unhooked-flag-close" type="button" data-unhooked-dime-dismiss aria-label="Dismiss Unhooked Dime invitation">
          <span aria-hidden="true">×</span>
        </button>
        <p class="unhooked-flag-eyebrow">Interactive thesis · 01</p>
        <h2 id="unhooked-dime-title" class="unhooked-flag-title">Unhooked Dime</h2>
        <p class="unhooked-flag-headline">How we saved a billion dollars for you</p>
        <p class="unhooked-flag-copy">See how addictive products price your attention — and how ZenMode changes the equation.</p>
        <a class="unhooked-flag-cta" href="/unhooked-dime" data-link>
          <span>Explore the thesis</span>
          <span aria-hidden="true">→</span>
        </a>
        <p class="unhooked-flag-footer">4 min interactive read</p>
      </div>
    </aside>
  `;
}

export function initUnhookedDimeFlag({ currentPath, navigate }) {
  const flag = document.querySelector("[data-unhooked-dime-flag]");
  if (!flag) return;

  const dismissed = sessionStorage.getItem(DISMISS_KEY) === "true";
  flag.hidden = dismissed || currentPath === "/unhooked-dime";
  if (flag.hidden || flag.dataset.unhookedDimeBound === "true") return;

  const close = flag.querySelector("[data-unhooked-dime-dismiss]");
  const card = flag.querySelector("[data-unhooked-dime-card]");

  flag.dataset.unhookedDimeBound = "true";

  close?.addEventListener("click", (event) => {
    event.stopPropagation();
    sessionStorage.setItem(DISMISS_KEY, "true");
    flag.hidden = true;
  });

  card?.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    navigate("/unhooked-dime");
  });

  card?.addEventListener("keydown", (event) => {
    if (event.target.closest("a, button")) return;
    if (event.key === "Enter") {
      navigate("/unhooked-dime");
    }
  });
}
