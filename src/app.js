import { ICON_NAMES, iconSvg } from "./icons.js";

const BASE = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

const app = document.querySelector("#app");

let TOKENS;
let currentTheme = localStorage.getItem("zenmode-theme") || "dark";

const navGroups = [
  {
    title: "Overview",
    links: [{ href: "/", label: "Overview" }]
  },
  {
    title: "Foundations",
    links: [
      { href: "/foundations/typography", label: "Typography" },
      { href: "/foundations/color", label: "Color" },
      { href: "/foundations/icons", label: "Icons" }
    ]
  },
  {
    title: "Components",
    links: [{ href: "/components", label: "Components" }]
  },
  {
    title: "Reference",
    links: [{ href: "/tokens", label: "Tokens" }]
  }
];

const routes = {
  "/": pageOverview,
  "/foundations/typography": pageTypography,
  "/foundations/color": pageColor,
  "/foundations/icons": pageIcons,
  "/components": pageComponents,
  "/tokens": pageTokens
};

const mcpLaunchCommand = "node mcp/zenmode-mcp.mjs";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("zenmode-theme", theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  document.querySelectorAll("[data-global-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.globalTheme === theme));
  });
}

function shell() {
  const nav = navGroups.map((group) => `
    <nav class="nav-group" aria-label="${esc(group.title)}">
      <p class="nav-title">${esc(group.title)}</p>
      ${group.links.map((link) => `<a class="nav-link" href="${link.href}" data-link>${esc(link.label)}</a>`).join("")}
    </nav>
  `).join("");

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">Z</div>
          <div>
            <h1>ZenMode</h1>
            <p>Zenmode_V2 design-system reference.</p>
          </div>
        </div>
        <div class="global-theme" aria-label="Global theme">
          <button class="theme-choice" type="button" data-global-theme="dark">Dark</button>
          <button class="theme-choice" type="button" data-global-theme="light">Light</button>
        </div>
        <div class="sidebar-nav">
          ${nav}
        </div>
        <section class="mcp-card" aria-label="ZenMode MCP server">
          <p class="mcp-card-eyebrow">MCP Server</p>
          <p class="mcp-card-copy">Query tokens, routes, and foundations over MCP.</p>
          <div class="code-inline"><code>${esc(mcpLaunchCommand)}</code></div>
          <div class="mcp-card-actions">
            <button class="mcp-card-copy-button" type="button" data-mcp-copy-command>Copy command</button>
            <a class="mcp-card-link" href="mcp/README.md" target="_blank" rel="noreferrer">Guide</a>
          </div>
        </section>
      </aside>
      <main class="main">
        <div class="main-view" id="main" tabindex="-1"></div>
      </main>
    </div>
  `;
}

function normalizePath(pathname) {
  if (BASE && pathname.startsWith(BASE)) {
    pathname = pathname.slice(BASE.length) || "/";
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function renderRoute() {
  const path = normalizePath(window.location.pathname);
  const page = routes[path] || pageNotFound;
  const main = document.querySelector("#main");
  main.innerHTML = page();
  document.title = `${main.querySelector(".page-title")?.textContent || "ZenMode"} | ZenMode Design System`;
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", normalizePath(link.pathname) === path);
  });
  main.focus({ preventScroll: true });
  initPageInteractions();
}

function navigateTo(path) {
  history.pushState({}, "", BASE + path);
  renderRoute();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function initPageInteractions() {
  initCopyButtons();
  initMcpRunner();
  initTokenExplorer();
}

function initMcpRunner() {
  const button = document.querySelector("[data-mcp-copy-command]");
  if (!button || button.dataset.mcpRunnerBound === "true") return;

  button.dataset.mcpRunnerBound = "true";
  button.addEventListener("click", async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(mcpLaunchCommand);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Copy failed";
    }
    window.setTimeout(() => {
      button.textContent = original;
    }, 1300);
  });
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy-button]").forEach((button) => {
    if (button.dataset.copyBound === "true") return;
    button.dataset.copyBound = "true";
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block")?.querySelector("code")?.textContent || "";
      await navigator.clipboard.writeText(code);
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1100);
    });
  });

  document.querySelectorAll("[data-swatch-copy]").forEach((swatch) => {
    if (swatch.dataset.copyBound === "true") return;
    swatch.dataset.copyBound = "true";
    swatch.addEventListener("click", async () => {
      await navigator.clipboard.writeText(swatch.dataset.swatchCopy);
      const label = swatch.querySelector("[data-swatch-hex]");
      if (!label) return;
      const original = label.textContent;
      label.textContent = "Copied";
      window.setTimeout(() => {
        label.textContent = original;
      }, 1000);
    });
  });

  document.querySelectorAll("[data-icon-copy]").forEach((tile) => {
    if (tile.dataset.copyBound === "true") return;
    tile.dataset.copyBound = "true";
    tile.addEventListener("click", async () => {
      await navigator.clipboard.writeText(tile.dataset.iconCopy);
      const label = tile.querySelector("[data-icon-copy-label]");
      if (!label) return;
      const original = label.textContent;
      label.textContent = "Copied";
      window.setTimeout(() => {
        label.textContent = original;
      }, 1000);
    });
  });
}

function pageHeader(eyebrow, title, lede) {
  return `
    <header class="page-header">
      <div class="eyebrow">${esc(eyebrow)}</div>
      <h2 class="page-title">${esc(title)}</h2>
      <p class="page-lede">${esc(lede)}</p>
    </header>
  `;
}

function codeBlock(language, code) {
  return `
    <div class="code-block">
      <div class="code-head">
        <span class="code-lang">${esc(language)}</span>
        <button class="copy-button" type="button" data-copy-button>Copy</button>
      </div>
      <pre><code>${esc(code.trim())}</code></pre>
    </div>
  `;
}

function swatch(name, hex) {
  return `
    <button class="swatch-tile" type="button" data-swatch-copy="${esc(hex)}" aria-label="Copy ${esc(name)} ${esc(hex)}">
      <span class="swatch-chip" style="--swatch: ${esc(hex)}"></span>
      <span class="swatch-meta">
        <strong>${esc(name)}</strong>
        <span data-swatch-hex>${esc(hex)}</span>
      </span>
    </button>
  `;
}

function pageOverview() {
  const foundationLinks = navGroups.find((group) => group.title === "Foundations").links;

  return `
    <article class="page overview-page">
      <section class="overview-hero">
        <div class="brand-mark large" aria-hidden="true">Z</div>
        <p class="eyebrow">Zenmode_V2</p>
        <h2 class="page-title">The Design System</h2>
        <p class="page-lede">Typography, color, and iconography for ZenMode &mdash; a calmer, more mindful smartphone experience. Semantic and global tokens are shared across Figma, CSS, and this MCP server so every surface speaks the same language.</p>
        <div class="overview-actions">
          <a class="download-link primary-link" href="/foundations/typography" data-link>Browse foundations</a>
          <a class="download-link" href="/tokens" data-link>View tokens</a>
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Start here</h3>
        <div class="grid three">
          ${foundationLinks.map((link) => `
            <a class="info-tile" href="${link.href}" data-link><h3>${esc(link.label)}</h3><p>${esc(link.href)}</p></a>
          `).join("")}
          <a class="info-tile" href="/tokens" data-link><h3>Tokens</h3><p>/tokens</p></a>
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Components</h3>
        <p class="section-copy">The component library is not published yet &mdash; check back soon.</p>
      </section>
    </article>
  `;
}

function pageTypography() {
  const rows = TOKENS.foundations.typography;

  return `
    <article class="page">
      ${pageHeader("Foundations", "Typography", "Three families cover the whole system: an expressive display face, a quiet micro-label face, and a tabular data face.")}
      <section class="section type-section">
        ${rows.map((row) => {
          const weights = row.weights.map((w) => `<span class="weight-chip">${esc(w.label)} <strong>${w.value}</strong></span>`).join("");
          let sample;
          if (row.sampleHours) {
            sample = `
              <div class="type-sample-data-row">
                <span class="type-sample-data-value">${esc(row.sampleHours)}</span><span class="type-sample-data-unit">HRS</span>
                <span class="type-sample-data-value">${esc(row.sampleMinutes)}</span><span class="type-sample-data-unit">MINS</span>
                <span class="type-sample-fraction">${esc(row.sampleFraction)}</span>
              </div>
            `;
          } else if (row.sampleSubtitle) {
            sample = `
              <p class="type-sample-title">${esc(row.sampleTitle)}</p>
              <p class="type-sample-subtitle">${esc(row.sampleSubtitle)}</p>
            `;
          } else {
            sample = `<p class="type-sample-title small">${esc(row.sampleTitle)}</p>`;
          }
          return `
            <div class="type-card">
              <div class="type-card-head">
                <div>
                  <h3>${esc(row.name)} &mdash; ${esc(row.role)}</h3>
                  <p>${esc(row.description)}</p>
                </div>
              </div>
              <div class="type-card-sample" style="--type-family: '${esc(row.name)}';">
                ${sample}
                <p class="type-sample-body">${esc(row.sampleBody)}</p>
              </div>
              <div class="weight-row">${weights}</div>
            </div>
          `;
        }).join("")}
      </section>
      <section class="section">
        ${codeBlock("CSS", `
.type-display {
  font-family: "Cabinet Grotesque", "Plus Jakarta Sans", sans-serif;
  font-weight: 800;
}

.type-micro {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 500;
}

.type-data {
  font-family: "Reddit Mono", monospace;
  font-variant-numeric: tabular-nums;
}`)}
      </section>
    </article>
  `;
}

function pageColor() {
  const groups = TOKENS.foundations.colors;

  return `
    <article class="page">
      ${pageHeader("Foundations", "Colors", "Zen green carries the brand signal. Ink and neutrals build every surface. Status colors drive the buddy character states.")}
      <section class="section">
        ${groups.map((group) => `
          <div class="color-group">
            <h3>${esc(group.group)}</h3>
            <p class="section-copy">${esc(group.description)}</p>
            <div class="swatch-grid">
              ${group.swatches.map((s) => swatch(s.name, s.hex)).join("")}
            </div>
          </div>
        `).join("")}
      </section>
    </article>
  `;
}

function pageIcons() {
  const icons = TOKENS.foundations.icons;

  return `
    <article class="page">
      ${pageHeader("Foundations", "Icons", icons.description)}
      <section class="section">
        <div class="icon-grid">
          ${icons.names.map((name) => `
            <button class="icon-tile" type="button" data-icon-copy="${esc(name)}" aria-label="Copy ${esc(name)}">
              <span class="icon-tile-glyph">${iconSvg(name, 26)}</span>
              <span class="icon-tile-label" data-icon-copy-label>${esc(name)}</span>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="section">
        ${codeBlock("HTML", `
<svg class="icon" width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.7">
  <!-- IconHome path -->
</svg>`)}
      </section>
    </article>
  `;
}

function pageComponents() {
  return `
    <article class="page">
      ${pageHeader("Components", "Components", "The component library.")}
      <section class="section empty-section">
        <div class="empty-state">
          <p class="eyebrow">Coming soon</p>
          <h3>No components published yet</h3>
          <p>Buttons, cards, and other reusable pieces built from the Zenmode_V2 tokens will appear here.</p>
        </div>
      </section>
    </article>
  `;
}

function tokenExplorerSemanticTable(groupFilter) {
  const groups = TOKENS.collections.semantic.groups.filter((group) => groupFilter === "all" || group.name === groupFilter);

  return groups.map((group) => `
    <div class="te-table-group">
      <p class="te-table-group-title">${esc(group.name)}</p>
      <div class="te-table">
        <div class="te-row te-row-head">
          <span>Name</span><span>Light Mode</span><span>Dark Mode</span>
        </div>
        ${group.tokens.map((token) => `
          <div class="te-row">
            <span class="te-name">${esc(token.name)}</span>
            <span class="te-value-cell">
              <span class="swatch-chip small" style="--swatch: ${esc(token.lightHex)}"></span>${esc(token.light)}
            </span>
            <span class="te-value-cell">
              <span class="swatch-chip small" style="--swatch: ${esc(token.darkHex)}"></span>${esc(token.dark)}
            </span>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function tokenExplorerGlobalTable() {
  return `
    <div class="te-table-group">
      <div class="te-table">
        <div class="te-row te-row-head te-row-head-2col">
          <span>Name</span><span>Value</span>
        </div>
        ${TOKENS.collections.global.tokens.map((token) => `
          <div class="te-row te-row-2col">
            <span class="te-name">${esc(token.name)}</span>
            <span class="te-value-cell">
              <span class="swatch-chip small" style="--swatch: ${esc(token.value)}"></span>${esc(token.value)}
            </span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function pageTokens() {
  const semanticGroups = TOKENS.collections.semantic.groups;
  const semanticTotal = semanticGroups.reduce((sum, group) => sum + group.tokens.length, 0);
  const globalTotal = TOKENS.collections.global.tokens.length;

  return `
    <article class="page tokens-page">
      ${pageHeader("Reference", "Tokens", `${esc(TOKENS.meta.collection)} · Figma-mirrored collections for CSS, Compose, and code.`)}
      <section class="section">
        <div class="token-explorer" data-token-explorer>
          <div class="token-explorer-sidebar">
            <div class="te-block">
              <p class="te-label">Collections</p>
              <button class="te-collection active" type="button" data-te-collection="semantic">
                <span>${esc(TOKENS.collections.semantic.name)}</span><span class="te-count">${semanticTotal}</span>
              </button>
              <button class="te-collection" type="button" data-te-collection="global">
                <span>${esc(TOKENS.collections.global.name)}</span><span class="te-count">${globalTotal}</span>
              </button>
            </div>
            <div class="te-block" data-te-groups-block>
              <p class="te-label">Groups</p>
              <button class="te-group active" type="button" data-te-group="all">
                <span>All</span><span class="te-count">${semanticTotal}</span>
              </button>
              ${semanticGroups.map((group) => `
                <button class="te-group" type="button" data-te-group="${esc(group.name)}">
                  <span>${esc(group.name)}</span><span class="te-count">${group.tokens.length}</span>
                </button>
              `).join("")}
            </div>
          </div>
          <div class="token-explorer-main">
            <div data-te-table>${tokenExplorerSemanticTable("all")}</div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="grid two">
          <div class="info-tile">
            <h3>Download JSON</h3>
            <p>The project root contains the source file used by this site and the MCP server.</p>
            <a class="download-link" href="tokens.json" download>Download tokens.json</a>
          </div>
          <div class="info-tile">
            <h3>MCP access</h3>
            <p>Query these same collections from any MCP client using the bundled server.</p>
            <a class="download-link" href="mcp/README.md" target="_blank" rel="noreferrer">Read the MCP guide</a>
          </div>
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">CSS Variables</h3>
        ${codeBlock("CSS", `
:root[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --surface-elevated: #FFFFFF;
  --border-subtle: #E5E5E5;
  --border-focus: #00C700;
  --text-primary: #000000;
  --text-secondary: #525252;
  --text-brand: #00C700;
  --action-primary: #007700;
  --action-primary-text: #FFFFFF;
  --action-hover-pressed: #00C700;
}

:root[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-secondary: #1A1A1A;
  --surface-elevated: #525252;
  --border-subtle: #1A1A1A;
  --border-focus: #24FF24;
  --text-primary: #FFFFFF;
  --text-secondary: #A3A3A3;
  --text-brand: #24FF24;
  --action-primary: #00C700;
  --action-primary-text: #000000;
  --action-hover-pressed: #24FF24;
}`)}
      </section>
    </article>
  `;
}

function pageNotFound() {
  return `
    <article class="page">
      ${pageHeader("404", "Page Not Found", "This route is not in the ZenMode design-system map.")}
      <a class="download-link" href="/" data-link>Return to overview</a>
    </article>
  `;
}

function initTokenExplorer() {
  const explorer = document.querySelector("[data-token-explorer]");
  if (!explorer) return;

  const collectionButtons = explorer.querySelectorAll("[data-te-collection]");
  const groupsBlock = explorer.querySelector("[data-te-groups-block]");
  const groupButtons = explorer.querySelectorAll("[data-te-group]");
  const table = explorer.querySelector("[data-te-table]");

  let activeCollection = "semantic";
  let activeGroup = "all";

  const render = () => {
    table.innerHTML = activeCollection === "global" ? tokenExplorerGlobalTable() : tokenExplorerSemanticTable(activeGroup);
    groupsBlock.hidden = activeCollection === "global";
  };

  collectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCollection = button.dataset.teCollection;
      collectionButtons.forEach((b) => b.classList.toggle("active", b === button));
      render();
    });
  });

  groupButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeGroup = button.dataset.teGroup;
      groupButtons.forEach((b) => b.classList.toggle("active", b === button));
      render();
    });
  });
}

async function boot() {
  TOKENS = await fetch(new URL("../tokens.json", import.meta.url)).then((response) => response.json());
  shell();
  applyTheme(currentTheme);
  renderRoute();

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-link]");
    if (link && link.origin === window.location.origin) {
      event.preventDefault();
      navigateTo(normalizePath(link.pathname));
      return;
    }

    const globalTheme = event.target.closest("[data-global-theme]");
    if (globalTheme) {
      applyTheme(globalTheme.dataset.globalTheme);
    }
  });

  window.addEventListener("popstate", renderRoute);
}

boot();
