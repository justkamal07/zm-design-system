import { TOKEN_CARD_STATES, TOKEN_PACKAGE_META, tokenDownloadCard, tokenIcon } from "./tokenDownloadCard.js";
import { initUnhookedDimeFlag, unhookedDimeFlag } from "./unhookedDimeFlag.js";

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
      { href: "/foundations/color", label: "Color" },
      { href: "/foundations/typography", label: "Typography" },
      { href: "/foundations/spacing", label: "Spacing" },
      { href: "/foundations/motion", label: "Motion" },
      { href: "/foundations/elevation", label: "Elevation" },
      { href: "/foundations/device-modes", label: "Device Modes" }
    ]
  },
  {
    title: "Components",
    links: [
      { href: "/components/zen-island", label: "Zen Island" },
      { href: "/components/app-icon", label: "App Icon" },
      { href: "/components/v2-stats-card", label: "V2 Stats Card" },
      { href: "/components/v2-interactions", label: "V2 Interactions" },
      { href: "/components/dock", label: "Dock" },
      { href: "/components/buttons", label: "Buttons" },
      { href: "/components/pills-badges", label: "Pills & Badges" },
      { href: "/components/cards", label: "Cards" },
      { href: "/components/nudge-banner", label: "Nudge Banner" },
      { href: "/components/milestone-numeral", label: "Milestone Numeral" }
    ]
  },
  {
    title: "Patterns",
    links: [
      { href: "/patterns/home-grid", label: "Home Grid" },
      { href: "/patterns/pause-flow", label: "Pause Flow" },
      { href: "/patterns/device-sync", label: "Device Sync" }
    ]
  },
  {
    title: "Reference",
    links: [
      { href: "/tokens", label: "Tokens" },
      { href: "/unhooked-dime", label: "Unhooked Dime" }
    ]
  }
];

const routes = {
  "/": pageOverview,
  "/foundations/color": pageColor,
  "/foundations/typography": pageTypography,
  "/foundations/spacing": pageSpacing,
  "/foundations/motion": pageMotion,
  "/foundations/elevation": pageElevation,
  "/foundations/device-modes": pageDeviceModes,
  "/components/zen-island": pageZenIsland,
  "/components/app-icon": pageAppIcon,
  "/components/v2-stats-card": pageV2StatsCard,
  "/components/v2-interactions": pageV2Interactions,
  "/components/dock": pageDock,
  "/components/buttons": pageButtons,
  "/components/pills-badges": pagePillsBadges,
  "/components/cards": pageCards,
  "/components/nudge-banner": pageNudgeBanner,
  "/components/milestone-numeral": pageMilestoneNumeral,
  "/patterns/home-grid": pageHomeGrid,
  "/patterns/pause-flow": pagePauseFlow,
  "/patterns/device-sync": pageDeviceSync,
  "/tokens": pageTokens,
  "/unhooked-dime": pageUnhookedDime
};

const motionEaseOptions = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)"
};

const mcpLaunchCommand = '"/Users/kamalraajsenthilkumar/Documents/ZenMode Design System/run-zenmode-mcp.sh"';

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toVarName(tokenName) {
  return `--${tokenName.replaceAll(".", "-")}`;
}

function applyTokenVars(target, theme) {
  Object.entries(TOKENS.semantic).forEach(([name, value]) => {
    target.style.setProperty(toVarName(name), value[theme]);
  });

  Object.entries(TOKENS.motion.duration).forEach(([name, value]) => {
    target.style.setProperty(`--motion-${name}`, `${value.value}${value.unit}`);
  });

  Object.entries(TOKENS.motion.easing).forEach(([name, value]) => {
    if (name !== "breath") {
      target.style.setProperty(`--ease-${name}`, value.value);
    }
  });
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("zenmode-theme", theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  applyTokenVars(document.documentElement, theme);

  document.querySelectorAll("[data-global-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.globalTheme === theme));
  });
}

function setPreviewTheme(preview, theme) {
  preview.dataset.previewTheme = theme;
  applyTokenVars(preview, theme);
  preview.querySelectorAll("[data-preview-theme-button]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.previewThemeButton === theme));
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
      <section class="mcp-runner" aria-label="ZenMode MCP server">
        <div class="runner-track" aria-hidden="true">
          <div class="runner-marquee">
            <span>ZenMode MCP server is ready</span>
            <span>Use tokens, routes, and component snippets through MCP</span>
            <span>Copy the local server command</span>
            <span>Query color.v2, token cards, and responsive sidebar styles</span>
            <span>ZenMode MCP server is ready</span>
            <span>Use tokens, routes, and component snippets through MCP</span>
            <span>Copy the local server command</span>
            <span>Query color.v2, token cards, and responsive sidebar styles</span>
          </div>
        </div>
        <div class="runner-actions">
          <button class="runner-copy" type="button" data-mcp-copy-command aria-label="Copy MCP server launch command">Copy server</button>
          <a class="runner-link" href="/mcp/README.md" target="_blank" rel="noreferrer">MCP guide</a>
        </div>
      </section>
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">Z</div>
          <div>
            <h1>ZenMode</h1>
            <p>Design-system reference for a calm Android launcher.</p>
          </div>
        </div>
        <div class="global-theme" aria-label="Global theme">
          <button class="theme-choice" type="button" data-global-theme="dark">Dark</button>
          <button class="theme-choice" type="button" data-global-theme="light">Light</button>
        </div>
        <div class="sidebar-nav">
          ${nav}
        </div>
        ${tokenDownloadCard({ id: "sidebar-token-download", compact: true, condensed: true, className: "sidebar-cta" })}
      </aside>
      <main class="main">
        <div class="main-view" id="main" tabindex="-1"></div>
      </main>
      ${unhookedDimeFlag()}
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
  applyTheme(currentTheme);
  initPageInteractions();
}

function navigateTo(path) {
  history.pushState({}, "", BASE + path);
  renderRoute();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function initPageInteractions() {
  document.querySelectorAll(".preview").forEach((preview) => {
    setPreviewTheme(preview, preview.dataset.previewTheme || currentTheme);
  });

  initCopyButtons();
  initMotionLab();
  initZenDemo();
  initPauseFlow();
  initDeviceSync();
  initV2Interactions();
  initTokenDownloadCards();
  initMcpRunner();
  initUnhookedDimeFlag({
    currentPath: normalizePath(window.location.pathname),
    navigate: navigateTo
  });
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

function setTokenCardState(card, stateName) {
  const state = TOKEN_CARD_STATES[stateName] || TOKEN_CARD_STATES.default;
  const button = card.querySelector("[data-token-download-action]");
  const label = card.querySelector("[data-token-download-label]");
  const icon = card.querySelector("[data-token-download-icon]");
  const status = card.querySelector("[data-token-download-status]");

  card.dataset.tokenCardState = stateName;
  if (button) {
    button.disabled = stateName === "disabled";
    button.setAttribute("aria-disabled", String(stateName === "disabled"));
  }
  if (label) label.textContent = state.action;
  if (icon) icon.innerHTML = tokenIcon(state.icon);
  if (status) {
    status.textContent = state.status;
    status.dataset.statusTone = state.tone;
  }
}

function downloadTokenPackage() {
  if (!TOKENS) throw new Error("Tokens are not loaded");

  const packageData = {
    name: "ZenMode token package",
    version: TOKEN_PACKAGE_META.version,
    formats: TOKEN_PACKAGE_META.formats,
    source: TOKEN_PACKAGE_META.sourceHref,
    tokens: TOKENS
  };
  const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `zenmode-token-package-${TOKEN_PACKAGE_META.version}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function initTokenDownloadCards() {
  document.querySelectorAll("[data-token-download-card]").forEach((card) => {
    if (card.dataset.tokenCardBound === "true") return;

    const button = card.querySelector("[data-token-download-action]");
    if (!button) return;

    card.dataset.tokenCardBound = "true";
    button.addEventListener("click", async () => {
      if (button.disabled) return;

      setTokenCardState(card, "downloading");
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 420));
        downloadTokenPackage();
        setTokenCardState(card, "complete");
        window.setTimeout(() => {
          if (card.dataset.tokenCardState === "complete") {
            setTokenCardState(card, "default");
          }
        }, 1600);
      } catch (error) {
        setTokenCardState(card, "error");
      }
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy-button]").forEach((button) => {
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
}

function initMotionLab() {
  const lab = document.querySelector("[data-motion-lab]");
  if (!lab) return;

  const range = lab.querySelector("[data-motion-duration]");
  const output = lab.querySelector("[data-motion-output]");
  const easing = lab.querySelector("[data-motion-easing]");
  const dot = lab.querySelector(".motion-dot");
  const play = lab.querySelector("[data-motion-play]");
  const compare = lab.querySelector("[data-compare-play]");
  const defaultCard = lab.querySelector("[data-compare-default]");
  const reflectCard = lab.querySelector("[data-compare-reflect]");

  const update = () => {
    output.textContent = `${range.value}ms`;
    dot.style.transition = `transform ${range.value}ms ${motionEaseOptions[easing.value]}`;
  };

  range.addEventListener("input", update);
  easing.addEventListener("change", update);
  play.addEventListener("click", () => {
    update();
    dot.classList.remove("play");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dot.classList.add("play"));
    });
  });

  compare.addEventListener("click", () => {
    defaultCard.classList.remove("reflecting");
    reflectCard.classList.remove("reflecting");
    requestAnimationFrame(() => {
      defaultCard.classList.add("reflecting");
      reflectCard.classList.add("reflecting");
    });
  });

  update();
}

function initZenDemo() {
  const demo = document.querySelector("[data-zen-demo]");
  if (!demo) return;

  const island = demo.querySelector(".zen-island");
  const arc = demo.querySelector(".arc");
  const time = demo.querySelector("[data-zen-time]");
  const label = demo.querySelector("[data-zen-label]");
  const run = demo.querySelector("[data-run-zen]");
  const stay = demo.querySelector("[data-stay-zen]");
  const open = demo.querySelector("[data-open-zen]");
  let timers = [];

  const clear = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const setState = (state) => {
    island.classList.toggle("reflect", state === "reflect");
    island.classList.toggle("resolved", state === "stayed" || state === "opened");
    if (state === "idle") {
      arc.style.setProperty("--progress", "0%");
      time.textContent = "0:08";
      label.textContent = "Ready before opening";
    }
    if (state === "reflect") {
      arc.style.setProperty("--progress", "100%");
      time.textContent = "0:03";
      label.textContent = "Take one breath";
    }
    if (state === "stayed") {
      arc.style.setProperty("--progress", "100%");
      time.textContent = "stay";
      label.textContent = "Stayed present";
    }
    if (state === "opened") {
      arc.style.setProperty("--progress", "100%");
      time.textContent = "open";
      label.textContent = "Opened anyway";
    }
  };

  run.addEventListener("click", () => {
    clear();
    setState("idle");
    timers.push(window.setTimeout(() => setState("reflect"), 120));
    timers.push(window.setTimeout(() => setState("stayed"), 1250));
  });
  stay.addEventListener("click", () => {
    clear();
    setState("stayed");
  });
  open.addEventListener("click", () => {
    clear();
    setState("opened");
  });
}

function initPauseFlow() {
  const flow = document.querySelector("[data-pause-flow]");
  if (!flow) return;

  const range = flow.querySelector("[data-flow-range]");
  const prev = flow.querySelector("[data-flow-prev]");
  const next = flow.querySelector("[data-flow-next]");
  const steps = flow.querySelectorAll(".flow-step");
  const island = flow.querySelector(".zen-island");
  const arc = flow.querySelector(".arc");
  const time = flow.querySelector("[data-flow-time]");
  const label = flow.querySelector("[data-flow-label]");

  const states = [
    { progress: "0%", time: "tap", label: "App requested", reflect: false },
    { progress: "36%", time: "0:05", label: "Pause begins", reflect: false },
    { progress: "100%", time: "0:03", label: "Take one breath", reflect: true },
    { progress: "100%", time: "stay", label: "Stayed present", reflect: false }
  ];

  const update = (index) => {
    const state = states[index];
    range.value = index;
    arc.style.setProperty("--progress", state.progress);
    time.textContent = state.time;
    label.textContent = state.label;
    island.classList.toggle("reflect", state.reflect);
    island.classList.toggle("resolved", index === 3);
    steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === index));
  };

  range.addEventListener("input", () => update(Number(range.value)));
  prev.addEventListener("click", () => update(Math.max(0, Number(range.value) - 1)));
  next.addEventListener("click", () => update(Math.min(3, Number(range.value) + 1)));
  update(0);
}

function initDeviceSync() {
  const sync = document.querySelector("[data-device-sync]");
  if (!sync) return;

  const modes = {
    focus: {
      ring: "var(--color-accent-reflect)",
      label: "Focus",
      device: "2H 34M",
      phone: "Deep work running",
      progress: "100%",
      time: "82%",
      note: "Ring and launcher both use color.accent.reflect."
    },
    reminder: {
      ring: "var(--color-warn-amber)",
      label: "Reminder",
      device: "0H 42M",
      phone: "Nudge due",
      progress: "58%",
      time: "limit",
      note: "Amber owns gentle nudges across hardware and software."
    },
    break: {
      ring: "var(--color-mode-break)",
      label: "Break",
      device: "0H 15M",
      phone: "Rest window",
      progress: "24%",
      time: "rest",
      note: "Break uses warm coral only for the rest state, never warnings."
    }
  };

  const puck = sync.querySelector(".puck");
  const readout = sync.querySelector("[data-sync-readout]");
  const modeLabel = sync.querySelector("[data-sync-mode]");
  const phoneLabel = sync.querySelector("[data-sync-phone]");
  const note = sync.querySelector("[data-sync-note]");
  const arc = sync.querySelector(".arc");
  const time = sync.querySelector("[data-sync-time]");
  const buttons = sync.querySelectorAll("[data-sync-set]");

  const update = (modeName) => {
    const mode = modes[modeName];
    sync.style.setProperty("--ring", mode.ring);
    puck.style.setProperty("--ring", mode.ring);
    readout.textContent = mode.device;
    modeLabel.textContent = mode.label;
    phoneLabel.textContent = mode.phone;
    note.textContent = mode.note;
    arc.style.setProperty("--progress", mode.progress);
    time.textContent = mode.time;
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.syncSet === modeName));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => update(button.dataset.syncSet));
  });
  update("focus");
}

function initV2Interactions() {
  const demo = document.querySelector("[data-v2-love-demo]");
  if (!demo) return;

  const love = demo.querySelector("[data-v2-send-love]");
  const toast = demo.querySelector("[data-v2-toast]");
  const count = demo.querySelector("[data-v2-count]");
  let sent = false;

  love.addEventListener("click", () => {
    sent = !sent;
    love.classList.toggle("focused", sent);
    toast.hidden = !sent;
    count.textContent = sent ? "3" : "2";
    love.dataset.count = sent ? "3" : "2";
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

function preview(title, subtitle, body, options = {}) {
  const theme = options.theme || "dark";
  const center = options.center ? " center" : "";
  return `
    <section class="preview" data-preview-theme="${theme}">
      <div class="preview-top">
        <div class="preview-title">
          <strong>${esc(title)}</strong>
          <span>${esc(subtitle)}</span>
        </div>
        <div class="segmented" aria-label="Preview theme">
          <button type="button" data-preview-theme-button="dark">Dark</button>
          <button type="button" data-preview-theme-button="light">Light</button>
        </div>
      </div>
      <div class="preview-stage${center}">
        ${body}
      </div>
    </section>
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

function guidance(doText, dontText) {
  return `
    <div class="guidance">
      <div class="do-dont do">
        <strong>Do</strong>
        <span>${esc(doText)}</span>
      </div>
      <div class="do-dont dont">
        <strong>Don't</strong>
        <span>${esc(dontText)}</span>
      </div>
    </div>
  `;
}

function tokenTable(rows) {
  return `<div class="token-table">${rows.map((row) => `
    <div class="token-row">
      <div class="token-name">${esc(row.name)}</div>
      <div class="swatch-line">
        ${row.swatch ? `<span class="swatch" style="--swatch: ${esc(row.swatch)}"></span>` : ""}
        <span class="token-value">${esc(row.value)}</span>
      </div>
      <div class="token-value">${esc(row.primitive || "")}</div>
      <div class="token-usage">${esc(row.usage)}</div>
    </div>
  `).join("")}</div>`;
}

function semanticRows(theme, prefix = "") {
  return Object.entries(TOKENS.semantic)
    .filter(([name]) => !prefix || name.startsWith(prefix))
    .map(([name, value]) => ({
      name,
      value: value[theme],
      primitive: value.primitive?.[theme] || "",
      usage: value.usage,
      swatch: value[theme].startsWith("#") || value[theme].startsWith("rgb") ? value[theme] : ""
    }));
}

function primitiveRows(prefixes) {
  return Object.entries(TOKENS.primitives)
    .filter(([name]) => prefixes.some((prefix) => name.startsWith(prefix)))
    .map(([name, value]) => ({
      name,
      value,
      primitive: "Primitive",
      usage: "Raw value without semantic role.",
      swatch: value
    }));
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const bigint = Number.parseInt(value, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function relativeLuminance(hex) {
  return hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function contrastChip(title, foreground, background, note) {
  const ratio = contrastRatio(foreground, background);
  const label = ratio >= 4.5 ? "AA body" : ratio >= 3 ? "AA large" : "visual only";
  return `
    <div class="contrast-chip" style="--sample-fg: ${foreground}; --sample-bg: ${background};">
      <strong>${esc(title)}</strong>
      <span>${ratio.toFixed(2)}:1 · ${label}</span>
      <small>${esc(note)}</small>
    </div>
  `;
}

function appIcon(label, letter, state = "", color = "var(--color-accent-calm)") {
  return `
    <div class="app-icon ${state}" style="--icon-color: ${color}">
      <div class="app-icon-tile" aria-hidden="true">${esc(letter)}</div>
      <span>${esc(label)}</span>
    </div>
  `;
}

function v2Bars(color = "var(--color-v2-action-primary)", filled = 10) {
  return `
    <div class="v2-bars" style="--bar: ${color}">
      ${Array.from({ length: 12 }, (_, index) => `<span style="--fill: ${index < filled ? 100 : 28}%"></span>`).join("")}
    </div>
  `;
}

function v2LoveBadge({ type = "got", focused = false, count = 2 } = {}) {
  return `<div class="v2-love ${type} ${focused ? "focused" : ""}" data-count="${count}" aria-label="Love reaction"><span aria-hidden="true">💚</span><span class="sr-only" data-v2-count>${count}</span></div>`;
}

function v2StatCard({
  state = "high",
  title = "My Screen Time",
  hours = "00",
  minutes = "37",
  percent = "+30%",
  gotLove = true,
  reactLove = true,
  focusedLove = false
} = {}) {
  if (state === "inactive") {
    return `
      <div class="v2-stat-card inactive">
        <div class="v2-card-art">
          <div class="v2-eyes"><span class="v2-eye"></span><span class="v2-eye"></span></div>
          <div class="v2-mouth"></div>
        </div>
        <div class="v2-inactive-copy">
          <strong>Get your Buddy!</strong>
          <span>pick a wise one!❤️</span>
          <button class="v2-invite" type="button">Invite buddy</button>
        </div>
        ${gotLove ? v2LoveBadge({ type: "got" }) : ""}
        ${reactLove ? v2LoveBadge({ type: "react", focused: focusedLove }) : ""}
      </div>
    `;
  }

  const fill = state === "low" ? 5 : state === "medium" ? 9 : 11;
  const barColor = state === "low" ? "var(--color-v2-card-low)" : state === "medium" ? "var(--color-v2-card-medium)" : "var(--color-v2-action-primary)";

  return `
    <div class="v2-stat-card ${state}">
      <div class="v2-card-art">
        <div class="v2-eyes"><span class="v2-eye"></span><span class="v2-eye"></span></div>
        <div class="v2-mouth"></div>
      </div>
      <div class="v2-card-details">
        <div class="v2-card-title"><span>${esc(title)}</span><span class="v2-card-percent">${esc(percent)}</span></div>
        <div class="v2-time"><strong>${esc(hours)}</strong><span>HRS</span><strong>${esc(minutes)}</strong><span>MINS</span></div>
        <div class="v2-mindfulness"><span>Mindfulness</span>${v2Bars(barColor, fill)}</div>
      </div>
      ${gotLove ? v2LoveBadge({ type: "got" }) : ""}
      ${reactLove ? v2LoveBadge({ type: "react", focused: focusedLove }) : ""}
    </div>
  `;
}

function v2AppIcon({ locked = false, pinned = false, notify = false } = {}) {
  return `
    <div class="v2-app-icon ${locked ? "locked" : ""} ${pinned ? "pinned" : ""} ${notify ? "notify" : ""}">
      ${pinned ? `<span class="v2-pin">★</span>` : ""}
      ${notify ? `<span class="v2-notify">30</span>` : ""}
    </div>
  `;
}

function v2SearchBar(pressed = false) {
  return `<div class="v2-search ${pressed ? "pressed" : ""}">Search apps &amp; everything</div>`;
}

function v2Toast(hidden = false) {
  return `
    <div class="v2-toast" ${hidden ? "hidden" : ""} data-v2-toast>
      <div class="v2-toast-icon">✓</div>
      <div>
        <strong>Your love sent to your zen buddy!!</strong>
        <span>Your appreciation will help your buddy fr</span>
      </div>
    </div>
  `;
}

function v2ResistanceMeter() {
  return `
    <div class="v2-resistance">
      <div class="v2-resistance-bars">
        ${Array.from({ length: 34 }, (_, index) => `<span style="--on: ${index < 7 ? 100 : index < 13 ? 28 : 10}%"></span>`).join("")}
      </div>
      <div class="v2-slider"></div>
    </div>
  `;
}

function v2PhoneHome({ screen = "dark" } = {}) {
  return `
    <div class="v2-phone" data-v2-screen="${screen}">
      <div class="v2-top-square"></div>
      <div class="v2-crown" aria-hidden="true">♕</div>
      <div class="v2-bolt" aria-hidden="true">ϟ</div>
      <div class="v2-header">
        <div class="v2-glow-core" aria-hidden="true"></div>
        <div class="v2-streak">streaks: 32</div>
      </div>
      <div class="v2-card-row">
        ${v2StatCard({ state: screen === "dark" ? "low" : "high", title: "My Screen Time", hours: screen === "dark" ? "07" : "00", minutes: screen === "dark" ? "59" : "37", gotLove: screen !== "dark", reactLove: false })}
        ${v2StatCard({ state: "medium", title: "My buddy stats", hours: "01", minutes: "60", gotLove: false, reactLove: true, focusedLove: true })}
      </div>
      <div class="v2-app-grid">
        ${v2AppIcon({ locked: true })}
        ${v2AppIcon({ pinned: true, notify: true })}
        ${v2AppIcon({ pinned: true })}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
        ${v2AppIcon()}
      </div>
      ${v2ResistanceMeter()}
      <div class="v2-footer">
        <div class="v2-footer-icon" aria-label="Settings">⚙</div>
        ${v2SearchBar(false)}
        <div class="v2-footer-icon" aria-label="Phone">☏</div>
      </div>
    </div>
  `;
}

function puck(mode = "focus", readout = "2H 34M") {
  const ring = {
    focus: "var(--color-accent-reflect)",
    reminder: "var(--color-warn-amber)",
    break: "var(--color-mode-break)"
  }[mode];

  return `
    <div class="puck" style="--ring: ${ring}">
      <div class="usb-c" aria-hidden="true"></div>
      <div class="battery-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <div class="puck-display">
        <img class="puck-logo" alt="" src="/assets/kavi-iot-logo.png" />
        <div class="puck-readout">${esc(readout)}</div>
      </div>
    </div>
  `;
}

function statsView() {
  return `
    <div class="stats-view">
      <div class="stats-total">
        <span class="caption">Screen Time</span>
        <strong>2H 34M</strong>
        <span class="token-usage">Across focus-aware apps today</span>
      </div>
      <div class="bar-chart" aria-label="Screen time by hour">
        <span style="--h: 28%"></span>
        <span style="--h: 44%"></span>
        <span style="--h: 32%"></span>
        <span style="--h: 72%"></span>
        <span style="--h: 52%"></span>
        <span style="--h: 86%"></span>
        <span style="--h: 38%"></span>
        <span style="--h: 22%"></span>
      </div>
      <div class="focus-score">
        <div class="focus-ring">82</div>
        <div>
          <span class="caption">Focus Score</span>
          <p class="token-usage">The companion app uses the dark token set: raised panels, green data bars, and a circular focus badge.</p>
        </div>
      </div>
    </div>
  `;
}

function dock() {
  return `
    <div class="dock" aria-label="Pinned apps">
      ${appIcon("Phone", "P", "", "var(--color-accent-calm)")}
      ${appIcon("Focus", "F", "focused", "var(--color-accent-reflect)")}
      ${appIcon("Notes", "N", "", "var(--color-warn-amber)")}
      ${appIcon("Maps", "M", "", "var(--color-accent-deep)")}
      ${appIcon("Music", "M", "muted", "var(--color-text-faint)")}
    </div>
  `;
}

function zenIsland({ progress = "0%", time = "0:08", label = "Ready before opening", mode = "" } = {}) {
  return `
    <div class="zen-island ${mode}">
      <div class="arc" style="--progress: ${progress}">
        <span>${esc(time)}</span>
      </div>
      <div class="island-copy">
        <strong>Zen Island</strong>
        <span>${esc(label)}</span>
      </div>
    </div>
  `;
}

function zenIslandInteractive() {
  return `
    <div class="grid" data-zen-demo>
      <div class="zen-island">
        <div class="arc" style="--progress: 0%">
          <span data-zen-time>0:08</span>
        </div>
        <div class="island-copy">
          <strong>Zen Island</strong>
          <span data-zen-label>Ready before opening</span>
          <div class="island-actions">
            <button class="mini-button" type="button" data-run-zen>Run pause</button>
            <button class="mini-button" type="button" data-stay-zen>Stay</button>
            <button class="mini-button" type="button" data-open-zen>Open</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function nudgeBanner() {
  return `
    <div class="nudge-banner">
      <div class="nudge-icon" aria-hidden="true">!</div>
      <div>
        <strong>Instagram is near today's limit</strong>
        <span>Pause for one breath before opening.</span>
      </div>
      <button class="mini-button" type="button">Review</button>
    </div>
  `;
}

function milestone() {
  return `
    <div class="milestone">
      <div class="milestone-number">500K</div>
      <div class="milestone-label">users stayed present</div>
    </div>
  `;
}

function phoneHome(flowStep = 0) {
  return v2PhoneHome({ screen: flowStep === 1 ? "light" : "dark" });
}

function stateTile(label, body) {
  return `
    <div class="state-tile">
      ${body}
      <div class="caption">${esc(label)}</div>
    </div>
  `;
}

function componentCodes(name) {
  const snippets = {
    zenIsland: {
      react: `
export function ZenIsland({ progress = 0, seconds = 8, state = "idle" }) {
  return (
    <section className={"zenIsland " + state}>
      <div className="arc" style={{ "--progress": progress + "%" }}>
        <span>{seconds}s</span>
      </div>
      <div>
        <strong>Zen Island</strong>
        <p>{state === "reflect" ? "Take one breath" : "Ready before opening"}</p>
      </div>
    </section>
  );
}`,
      compose: `
@Composable
fun ZenIsland(progress: Float, seconds: Int, state: PauseState) {
    Surface(
        color = ZenColor.surfaceRaised,
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, ZenColor.borderSubtle)
    ) {
        Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
            ArcProgress(progress = progress, label = "\${seconds}s")
            Spacer(Modifier.width(16.dp))
            Column {
                Text("Zen Island", style = ZenType.heading)
                Text(if (state == PauseState.Reflect) "Take one breath" else "Ready before opening")
            }
        }
    }
}`
    },
    appIcon: {
      react: `
export function AppIconTile({ label, glyph, state = "default" }) {
  return (
    <button className={"appIcon " + state} aria-label={label}>
      <span className="appIconTile">{glyph}</span>
      <span className="appIconLabel">{label}</span>
    </button>
  );
}`,
      compose: `
@Composable
fun AppIconTile(label: String, glyph: String, muted: Boolean = false) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            Modifier.size(54.dp).clip(RoundedCornerShape(8.dp))
                .background(if (muted) ZenColor.surfaceOverlay else ZenColor.surfaceRaised),
            contentAlignment = Alignment.Center
        ) { Text(glyph, style = ZenType.heading) }
        Text(label, style = ZenType.caption, maxLines = 1)
    }
}`
    },
    dock: {
      react: `
export function Dock({ apps }) {
  return (
    <nav className="dock" aria-label="Pinned apps">
      {apps.slice(0, 5).map((app) => (
        <AppIconTile key={app.id} label={app.label} glyph={app.glyph} />
      ))}
    </nav>
  );
}`,
      compose: `
@Composable
fun Dock(apps: List<LauncherApp>) {
    Row(
        Modifier.clip(RoundedCornerShape(8.dp))
            .background(ZenColor.surfaceRaised)
            .padding(14.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        apps.take(5).forEach { AppIconTile(it.label, it.glyph) }
    }
}`
    },
    buttons: {
      react: `
export function ZenButton({ variant = "primary", disabled, children, ...props }) {
  return (
    <button className={"zenButton " + variant} disabled={disabled} {...props}>
      {children}
    </button>
  );
}`,
      compose: `
@Composable
fun ZenButton(text: String, variant: ButtonVariant, enabled: Boolean = true, onClick: () -> Unit) {
    Button(
        enabled = enabled,
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = variant.container)
    ) {
        Text(text, style = ZenType.body.copy(fontWeight = FontWeight.SemiBold))
    }
}`
    },
    pills: {
      react: `
export function StatusPill({ live, children }) {
  return <span className={live ? "pill live" : "pill"}>{children}</span>;
}

export function CountBadge({ count }) {
  return <span className="badge" aria-label={count + " opens"}>{count}</span>;
}`,
      compose: `
@Composable
fun StatusPill(text: String, live: Boolean = false) {
    Row(
        Modifier.clip(CircleShape).background(ZenColor.surfaceOverlay).padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (live) Dot(color = ZenColor.accentReflect)
        Text(text, style = ZenType.caption)
    }
}`
    },
    cards: {
      react: `
export function ZenCard({ title, children }) {
  return (
    <section className="zenCard">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}`,
      compose: `
@Composable
fun ZenCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Surface(color = ZenColor.surfaceRaised, shape = RoundedCornerShape(8.dp), shadowElevation = 2.dp) {
        Column(Modifier.padding(18.dp)) {
            Text(title, style = ZenType.heading)
            Spacer(Modifier.height(8.dp))
            content()
        }
    }
}`
    },
    nudge: {
      react: `
export function NudgeBanner({ title, message, action }) {
  return (
    <aside className="nudgeBanner">
      <span aria-hidden="true">!</span>
      <div><strong>{title}</strong><p>{message}</p></div>
      {action}
    </aside>
  );
}`,
      compose: `
@Composable
fun NudgeBanner(title: String, message: String, action: @Composable () -> Unit) {
    Row(
        Modifier.clip(RoundedCornerShape(8.dp)).background(ZenColor.warnAmberDim).padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("!", color = ZenColor.warnAmber)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) { Text(title); Text(message, style = ZenType.caption) }
        action()
    }
}`
    },
    milestone: {
      react: `
export function MilestoneNumeral({ value, label }) {
  return (
    <div className="milestone">
      <strong className="milestoneNumber">{value}</strong>
      <span>{label}</span>
    </div>
  );
}`,
      compose: `
@Composable
fun MilestoneNumeral(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = ZenType.display.copy(brush = milestoneBrush()))
        Text(label, style = ZenType.heading, color = ZenColor.textSecondary)
    }
}`
    }
  };
  return snippets[name];
}

function codePair(name) {
  const snippets = componentCodes(name);
  return `
    <div class="grid two">
      ${codeBlock("React", snippets.react)}
      ${codeBlock("Compose", snippets.compose)}
    </div>
  `;
}

function pageOverview() {
  const referenceLinks = navGroups.flatMap((group) => group.links).filter((link) => link.href !== "/");

  return `
    <article class="page overview-page">
      <section class="overview-hero">
        <div class="overview-hero-copy">
          <p class="eyebrow">ZenMode V2 Reference</p>
          <h2 class="page-title">A calmer system for modern attention.</h2>
          <p class="page-lede">A modern design-system reference for ZenMode: expressive launcher cards, hardware-aware states, MCP-ready tokens, and interaction patterns that feel premium without becoming noisy.</p>
          <div class="overview-actions">
            <a class="download-link primary-link" href="/patterns/home-grid" data-link>Explore V2 home</a>
            <a class="download-link" href="/tokens" data-link>View tokens</a>
          </div>
          <div class="overview-stats" aria-label="ZenMode system highlights">
            <div><strong>V2</strong><span>launcher reference</span></div>
            <div><strong>32</strong><span>documented states</span></div>
            <div><strong>MCP</strong><span>server-ready tokens</span></div>
          </div>
        </div>
        <div class="overview-device" aria-label="ZenMode V2 home preview">
          ${phoneHome(0)}
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">System Principles</h3>
        <div class="grid three">
          <div class="info-tile"><span class="caption">01</span><h3>V2 home first</h3><p>The system now treats the V2 Figma home screen as the source of truth for launcher composition.</p></div>
          <div class="info-tile"><span class="caption">02</span><h3>Accountability with charm</h3><p>Screen-time, buddy stats, love reactions, and resistance cues are documented as living UI states.</p></div>
          <div class="info-tile"><span class="caption">03</span><h3>Shared source</h3><p>Figma variables, CSS properties, MCP resources, and code keep the same token language wherever possible.</p></div>
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Design Tracks</h3>
        <p class="section-copy">Start with foundations, move through components, then inspect product patterns in the same shell the team uses for implementation review.</p>
        <div class="grid four reference-grid">
          ${referenceLinks.map((link) => `
            <a class="info-tile" href="${link.href}" data-link><h3>${esc(link.label)}</h3><p>${esc(link.href)}</p></a>
          `).join("")}
        </div>
      </section>
    </article>
  `;
}

function pageColor() {
  const c = TOKENS.semantic;
  return `
    <article class="page">
      ${pageHeader("Foundations", "Color", "V2 adds product-specific grid, action, card, and interaction colors on top of the base ZenMode token set.")}
      <section class="section">
        <h3 class="section-title">Dark Semantic Tokens</h3>
        ${tokenTable(semanticRows("dark", "color."))}
      </section>
      <section class="section">
        <h3 class="section-title">Light Semantic Tokens</h3>
        ${tokenTable(semanticRows("light", "color."))}
      </section>
      <section class="section">
        <h3 class="section-title">Accent Contrast Checks</h3>
        <p class="section-copy">Reflect, amber, and break are checked where they are used: foreground accents on dark surfaces, filled UI treatments with readable text, and physical mode rings.</p>
        <div class="contrast-grid">
          ${contrastChip("Reflect on dark base", c["color.accent.reflect"].dark, c["color.surface.base"].dark, "Pause ring and large reflect label.")}
          ${contrastChip("Amber on dark base", c["color.warn.amber"].dark, c["color.surface.base"].dark, "Gentle warning foreground.")}
          ${contrastChip("Break on dark base", c["color.mode.break"].dark, c["color.surface.base"].dark, "Physical rest-state ring, not warning.")}
          ${contrastChip("V2 action on black", c["color.v2.action.primary"].dark, c["color.v2.background"].dark, "Streak, footer icons, and search focus.")}
          ${contrastChip("V2 text on cream", c["color.text.primary"].light, c["color.v2.background"].light, "Light-mode V2 home labels.")}
          ${contrastChip("Text on light reflect", c["color.text.primary"].light, c["color.accent.reflect"].light, "Button text over reflect fill.")}
          ${contrastChip("Text on light amber", c["color.text.primary"].light, c["color.warn.amber-dim"].light, "Nudge banner copy.")}
          ${contrastChip("Deep accent on light base", c["color.accent.deep"].light, c["color.surface.base"].light, "Use when green carries body-size text.")}
          ${contrastChip("Primary on raised", c["color.text.primary"].dark, c["color.surface.raised"].dark, "Default dark card copy.")}
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Primitive Palette</h3>
        ${tokenTable(primitiveRows(["green", "amber", "mode", "v2", "neutral"]))}
      </section>
      <section class="section">
        <h3 class="section-title">CSS Variables</h3>
        ${codeBlock("CSS", `
:root[data-theme="dark"] {
  --color-surface-base: #000000;
  --color-accent-reflect: #2FE28F;
  --color-warn-amber: #D98F3D;
  --color-mode-break: #E2543D;
  --color-v2-action-primary: #00C700;
  --color-v2-grid-rail: #430000;
}

:root[data-theme="light"] {
  --color-surface-base: #F5F4F0;
  --color-accent-reflect: #0FA968;
  --color-warn-amber: #B8722C;
  --color-mode-break: #E2543D;
  --color-v2-action-primary: #00C700;
  --color-v2-grid-rail: #F7DCDC;
}`)}
      </section>
    </article>
  `;
}

function pageTypography() {
  const rows = Object.entries(TOKENS.type).map(([name, token]) => ({
    name: `type.${name}`,
    value: `${token.family} ${token.weight} ${token.size}`,
    primitive: token.lineHeight,
    usage: token.usage
  }));

  return `
    <article class="page">
      ${pageHeader("Foundations", "Typography", "Inter carries docs UI, Bricolage and Reddit Mono carry V2 launcher cards, and Silkscreen carries streak/device readouts.")}
      <section class="section">
        ${preview("Type specimen", "Live scale using the documented tokens", `
          <div class="type-specimen">
            <div class="type-line"><div class="caption">Display</div><div class="type-sample-display">ZenMode</div></div>
            <div class="type-line"><div class="caption">Heading</div><div class="type-sample-heading">Evening folder</div></div>
            <div class="type-line"><div class="caption">Body</div><div class="type-sample-body">Pause before opening apps that pull attention away from the current moment.</div></div>
            <div class="type-line"><div class="caption">Caption</div><div class="type-sample-caption">72% · opens today</div></div>
            <div class="type-line"><div class="caption">Data</div><div class="type-sample-data">0:08</div></div>
            <div class="type-line"><div class="caption">Device</div><div class="type-sample-device">2H 34M</div></div>
            <div class="type-line"><div class="caption">V2 Title</div><div style="font:600 18px/24px var(--font-v2-ui);">My Screen Time</div></div>
            <div class="type-line"><div class="caption">V2 Data</div><div style="font:500 34px/38px var(--font-v2-data);">01 60</div></div>
            <div class="type-line"><div class="caption">V2 Chip</div><div style="font:400 16px/20px var(--font-device); letter-spacing:-0.08em;">streaks: 32</div></div>
          </div>
        `)}
      </section>
      <section class="section">
        <h3 class="section-title">Type Tokens</h3>
        ${tokenTable(rows)}
      </section>
      <section class="section">
        ${codeBlock("CSS", `
.zen-title {
  font-family: Inter, system-ui, sans-serif;
  font-size: 34px;
  font-weight: 800;
  line-height: 40px;
}

.zen-countdown {
  font-family: "JetBrains Mono", monospace;
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}`)}
      </section>
    </article>
  `;
}

function pageSpacing() {
  const rows = Object.entries(TOKENS.spacing).map(([name, token]) => ({
    name: `space.${name}`,
    value: token.value,
    primitive: "Shared",
    usage: token.usage
  }));

  return `
    <article class="page">
      ${pageHeader("Foundations", "Spacing", "A six-step scale keeps launcher layouts predictable without making the interface dense.")}
      <section class="section">
        <div class="spacing-scale">
          ${Object.entries(TOKENS.spacing).map(([name, token]) => `
            <div class="spacing-item">
              <div class="token-name">${esc(name)}</div>
              <div class="spacing-bar" style="--w: ${esc(token.value)}"></div>
              <div class="token-usage">${esc(token.value)} · ${esc(token.usage)}</div>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="section">
        ${preview("Layout grid", "16px app-grid gap with 24px comfortable padding", `
          <div class="layout-grid-demo">
            <div></div><div></div><div></div><div></div>
            <div></div><div></div><div></div><div></div>
          </div>
        `)}
      </section>
      <section class="section">
        <h3 class="section-title">Spacing Tokens</h3>
        ${tokenTable(rows)}
      </section>
      <section class="section">
        ${codeBlock("CSS", `
:root {
  --space-micro: 4px;
  --space-tight: 8px;
  --space-default: 16px;
  --space-comfortable: 24px;
  --space-section: 48px;
  --space-page: 88px;
}`)}
      </section>
    </article>
  `;
}

function pageMotion() {
  const durationRows = Object.entries(TOKENS.motion.duration).map(([name, token]) => ({
    name: `motion.${name}`,
    value: `${token.value}${token.unit}`,
    primitive: "Duration",
    usage: token.usage
  }));
  const easingRows = Object.entries(TOKENS.motion.easing).map(([name, token]) => ({
    name: `ease.${name}`,
    value: token.value,
    primitive: "Easing",
    usage: token.usage
  }));

  return `
    <article class="page">
      ${pageHeader("Foundations", "Motion", "Stillness is the resting state. The pause moment is deliberate, slow enough to be felt, and never bouncy.")}
      <section class="section">
        ${preview("Motion lab", "Scrub duration and easing on a sample element", `
          <div class="motion-lab" data-motion-lab>
            <div class="motion-controls">
              <div class="field">
                <label for="motion-duration">Duration <output data-motion-output>220ms</output></label>
                <input id="motion-duration" data-motion-duration type="range" min="100" max="800" step="10" value="220" />
              </div>
              <div class="field">
                <label for="motion-easing">Easing</label>
                <select id="motion-easing" data-motion-easing>
                  <option value="standard">standard</option>
                  <option value="decelerate">decelerate</option>
                  <option value="accelerate">accelerate</option>
                </select>
              </div>
              <button class="control-button" type="button" data-motion-play>Play</button>
            </div>
            <div class="motion-track"><div class="motion-dot"></div></div>
            <div class="compare-grid">
              <div class="compare-card" data-compare-default>
                <div class="caption">Default</div>
                ${appIcon("Browser", "B")}
              </div>
              <div class="compare-card" data-compare-reflect>
                <div class="caption">Reflect</div>
                ${zenIsland({ progress: "100%", time: "0:03", label: "Take one breath", mode: "reflect" })}
              </div>
            </div>
            <button class="control-button" type="button" data-compare-play>Compare default vs reflect</button>
          </div>
        `)}
      </section>
      <section class="section">
        <h3 class="section-title">Duration Tokens</h3>
        ${tokenTable(durationRows)}
      </section>
      <section class="section">
        <h3 class="section-title">Easing Tokens</h3>
        ${tokenTable(easingRows)}
      </section>
      <section class="section">
        ${codeBlock("CSS", `
.zen-island {
  transition:
    box-shadow var(--motion-deliberate) var(--ease-decelerate),
    transform var(--motion-base) var(--ease-standard);
}

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 80ms !important; animation-duration: 80ms !important; }
}`)}
      </section>
    </article>
  `;
}

function pageElevation() {
  return `
    <article class="page">
      ${pageHeader("Foundations", "Elevation", "Dark mode uses glow where shadows would disappear. Light mode keeps small, quiet shadows.")}
      <section class="section">
        ${preview("Elevation samples", "Raised and reflect treatments in both themes", `
          <div class="grid two">
            <div class="component-card"><strong>Raised</strong><p>Default card elevation for calm surfaces.</p></div>
            <div class="component-card" style="box-shadow: var(--elevation-reflect); border-color: color-mix(in srgb, var(--color-accent-reflect) 35%, var(--color-border-subtle));"><strong>Reflect</strong><p>Reserved for the pause moment.</p></div>
          </div>
        `)}
      </section>
      <section class="section">
        ${tokenTable(semanticRows("dark", "elevation."))}
      </section>
      <section class="section">
        ${codeBlock("CSS", `
.card {
  box-shadow: var(--elevation-raised);
}

.zen-island[data-state="reflect"] {
  box-shadow: var(--elevation-reflect);
}`)}
      </section>
    </article>
  `;
}

function pageDeviceModes() {
  const modeRows = [
    {
      name: "color.accent.reflect",
      value: TOKENS.semantic["color.accent.reflect"].dark,
      primitive: "green.400",
      usage: "Focus mode. Steady companion ring during deep work.",
      swatch: TOKENS.semantic["color.accent.reflect"].dark
    },
    {
      name: "color.warn.amber",
      value: TOKENS.semantic["color.warn.amber"].dark,
      primitive: "amber.500",
      usage: "Reminder mode. A nudge is due.",
      swatch: TOKENS.semantic["color.warn.amber"].dark
    },
    {
      name: "color.mode.break",
      value: TOKENS.semantic["color.mode.break"].dark,
      primitive: "mode.break",
      usage: "Break mode. Rest state only, not an error or warning.",
      swatch: TOKENS.semantic["color.mode.break"].dark
    }
  ];

  return `
    <article class="page">
      ${pageHeader("Foundations", "Device Modes", "The companion puck uses the same hues as the launcher so the desk and phone agree at a glance.")}
      <section class="section">
        ${preview("Ring modes", "Soft-touch matte black puck with subtle ambient LED", `
          <div class="device-mode-grid">
            <div class="device-card" style="--ring: var(--color-accent-reflect)">
              ${puck("focus", "2H 34M")}
              <div class="device-caption"><span class="caption">Focus</span><p>Steady green for deep work.</p></div>
            </div>
            <div class="device-card" style="--ring: var(--color-warn-amber)">
              ${puck("reminder", "0H 42M")}
              <div class="device-caption"><span class="caption">Reminder</span><p>Amber nudge without alarm language.</p></div>
            </div>
            <div class="device-card" style="--ring: var(--color-mode-break)">
              ${puck("break", "0H 15M")}
              <div class="device-caption"><span class="caption">Break</span><p>Warm coral rest state, never warning.</p></div>
            </div>
          </div>
        `)}
      </section>
      <section class="section">
        <h3 class="section-title">Mode Tokens</h3>
        ${tokenTable(modeRows)}
      </section>
      <section class="section">
        ${preview("Device display type", "Silkscreen appears only on the physical LED readout", `
          <div class="type-line">
            <div class="caption">type.device-display</div>
            <div class="type-sample-device">2H 34M</div>
          </div>
          <p class="section-copy">JetBrains Mono continues to own on-screen app numbers; Silkscreen is restricted to the puck matrix display.</p>
        `)}
      </section>
      <section class="section">
        <div class="device-note">Materials: soft-touch matte black, pocketable rounded-square footprint, subtle ambient ring, USB-C charging, four-dot battery indicator, and a quiet bottom speaker grille. The ring reaches full brightness only during the pause moment.</div>
      </section>
      <section class="section">
        ${codeBlock("CSS", `
:root {
  --color-mode-break: #E2543D;
  --font-device: Silkscreen, "JetBrains Mono", monospace;
}

.puck[data-mode="break"] {
  --ring: var(--color-mode-break);
}`)}
      </section>
    </article>
  `;
}

function pageZenIsland() {
  return `
    <article class="page">
      ${pageHeader("Components", "Zen Island", "The pause card uses a conic-gradient arc, JetBrains Mono countdown, and a breath-paced reflect glow.")}
      <section class="section">
        ${preview("Interactive render", "Run idle to reflect to resolved", zenIslandInteractive(), { center: true })}
      </section>
      <section class="section">
        <h3 class="section-title">States</h3>
        <div class="state-row">
          ${stateTile("Idle", zenIsland())}
          ${stateTile("Filling", zenIsland({ progress: "54%", time: "0:05", label: "Pause begins" }))}
          ${stateTile("Reflect", zenIsland({ progress: "100%", time: "0:03", label: "Take one breath", mode: "reflect" }))}
          ${stateTile("Resolved", zenIsland({ progress: "100%", time: "stay", label: "Stayed present", mode: "resolved" }))}
        </div>
      </section>
      <section class="section">${guidance("Use for the conscious pause before distracting apps open.", "Use as a generic card, notification, or decoration.")}</section>
      <section class="section">${codePair("zenIsland")}</section>
    </article>
  `;
}

function pageAppIcon() {
  return `
    <article class="page">
      ${pageHeader("Components", "App Icon Tile", "The launcher tile keeps labels legible at small sizes and reserves focus for intentional movement.")}
      <section class="section">
        ${preview("Icon states", "Default, focused, and muted", `
          <div class="app-grid">
            ${appIcon("Phone", "P")}
            ${appIcon("Focus", "F", "focused", "var(--color-accent-reflect)")}
            ${appIcon("Browser", "B", "muted", "var(--color-text-faint)")}
          </div>
        `, { center: true })}
      </section>
      <section class="section">${guidance("Use muted state for usage-limited apps without shaming the user.", "Animate icon tiles in the resting home screen.")}</section>
      <section class="section">${codePair("appIcon")}</section>
    </article>
  `;
}

function pageV2StatsCard() {
  return `
    <article class="page">
      ${pageHeader("Components", "V2 Stats Card", "The V2 home screen uses character cards for screen time and buddy stats, with love reactions attached to the card edges.")}
      <section class="section">
        ${preview("Stats card variants", "High, medium, low, and inactive buddy states from the V2 Figma component set", `
          <div class="grid four">
            ${v2StatCard({ state: "high", title: "My Screen Time", hours: "00", minutes: "37", gotLove: true, reactLove: true })}
            ${v2StatCard({ state: "medium", title: "My buddy stats", hours: "01", minutes: "60", gotLove: true, reactLove: true, focusedLove: true })}
            ${v2StatCard({ state: "low", title: "My Screen Time", hours: "01", minutes: "60", gotLove: true, reactLove: true })}
            ${v2StatCard({ state: "inactive", gotLove: false, reactLove: true })}
          </div>
        `)}
      </section>
      <section class="section">${guidance("Use the character card for daily screen-time accountability and buddy context.", "Use these expressive cards for quiet settings, token tables, or ordinary documentation surfaces.")}</section>
      <section class="section">
        ${codeBlock("HTML", `
<div class="v2-stat-card high">
  <div class="v2-card-art">
    <div class="v2-eyes"><span class="v2-eye"></span><span class="v2-eye"></span></div>
    <div class="v2-mouth"></div>
  </div>
  <div class="v2-card-details">
    <div class="v2-card-title"><span>My Screen Time</span><span class="v2-card-percent">+30%</span></div>
    <div class="v2-time"><strong>00</strong><span>HRS</span><strong>37</strong><span>MINS</span></div>
    <div class="v2-mindfulness"><span>Mindfulness</span><!-- meter bars --></div>
  </div>
</div>`)}
        ${codeBlock("Compose", `
@Composable
fun V2StatsCard(state: MindfulnessState, title: String, hours: String, minutes: String) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(2.dp, state.borderColor),
        color = state.containerColor
    ) {
        Column(Modifier.size(165.dp, 171.dp).padding(14.dp)) {
            CharacterMeter(state)
            Text(title, style = ZenType.v2Title)
            TimeValue(hours, minutes)
            MindfulnessBars(state.level)
        }
    }
}`)}
      </section>
    </article>
  `;
}

function pageV2Interactions() {
  return `
    <article class="page">
      ${pageHeader("Components", "V2 Interactions", "Small V2 components cover love reactions, search, app-icon badges, toast feedback, and resistance intensity.")}
      <section class="section">
        ${preview("Love interaction", "Click the love badge to show toast feedback", `
          <div class="grid two" data-v2-love-demo>
            <div style="display:grid; place-items:center; min-height:220px;">
              <div style="position:relative; width:165px; height:171px;">
                ${v2StatCard({ state: "medium", title: "My buddy stats", hours: "01", minutes: "60", gotLove: false, reactLove: false })}
                <button class="v2-love react" type="button" data-count="2" data-v2-send-love aria-label="Send love"><span aria-hidden="true">💚</span><span class="sr-only" data-v2-count>2</span></button>
              </div>
            </div>
            <div style="display:grid; gap:16px; align-content:center;">
              ${v2Toast(true)}
              ${v2SearchBar(false)}
              ${v2SearchBar(true)}
            </div>
          </div>
        `)}
      </section>
      <section class="section">
        ${preview("App and action pieces", "Pinned, notification, grant access, and resistance levels", `
          <div class="grid three">
            <div class="info-tile"><h3>App Icon</h3><div class="button-row">${v2AppIcon({ pinned: true, notify: true })}${v2AppIcon({ pinned: true })}${v2AppIcon({ locked: true })}</div></div>
            <div class="info-tile"><h3>Action</h3><button class="v2-grant" type="button">Grant access</button></div>
            <div class="info-tile"><h3>Resistance</h3><div class="v2-resistance-orbs"><span class="v2-resistance-orb low"></span><span class="v2-resistance-orb medium"></span><span class="v2-resistance-orb high"></span></div></div>
          </div>
        `)}
      </section>
      <section class="section">${guidance("Use love and toast feedback for buddy accountability moments.", "Use the love reaction as a generic like button across the launcher.")}</section>
      <section class="section">
        ${codeBlock("HTML", `
<button class="v2-love react" data-count="2" aria-label="Send love">
  <span aria-hidden="true">💚</span>
</button>

<div class="v2-toast">
  <div class="v2-toast-icon">✓</div>
  <div>
    <strong>Your love sent to your zen buddy!!</strong>
    <span>Your appreciation will help your buddy fr</span>
  </div>
</div>`)}
        ${codeBlock("CSS", `
.v2-search {
  border: 1px solid var(--color-v2-border-focus);
  border-radius: 149px;
  color: var(--color-text-secondary);
}

.v2-love.focused {
  background: color-mix(in srgb, var(--color-v2-action-primary) 18%, var(--color-v2-surface-secondary));
}`)}
      </section>
    </article>
  `;
}

function pageDock() {
  return `
    <article class="page">
      ${pageHeader("Components", "Dock", "The dock holds a small set of persistent apps with the same calm tile language as the grid.")}
      <section class="section">
        ${preview("Pinned apps", "4 to 5 icons, bottom aligned in product", dock(), { center: true })}
      </section>
      <section class="section">
        <h3 class="section-title">States</h3>
        <div class="state-row">
          ${stateTile("Default", dock())}
          ${stateTile("Focused", `<div class="dock">${appIcon("Focus", "F", "focused", "var(--color-accent-reflect)")}${appIcon("Notes", "N")}${appIcon("Maps", "M")}${appIcon("Phone", "P")}</div>`)}
          ${stateTile("Muted App", `<div class="dock">${appIcon("Browser", "B", "muted", "var(--color-text-faint)")}${appIcon("Notes", "N")}${appIcon("Maps", "M")}${appIcon("Phone", "P")}</div>`)}
          ${stateTile("Pressed", `<div class="dock" style="transform: translateY(1px);">${appIcon("Focus", "F", "", "var(--color-accent-reflect)")}${appIcon("Notes", "N")}${appIcon("Maps", "M")}${appIcon("Phone", "P")}</div>`)}
        </div>
      </section>
      <section class="section">${guidance("Limit the dock to habitual, utility-first apps.", "Use the dock as a second app drawer.")}</section>
      <section class="section">${codePair("dock")}</section>
    </article>
  `;
}

function pageButtons() {
  return `
    <article class="page">
      ${pageHeader("Components", "Buttons", "Buttons use accent fills only for clear, user-initiated decisions.")}
      <section class="section">
        ${preview("Button variants", "Primary, secondary, ghost, focused, disabled", `
          <div class="button-row">
            <button class="zm-button primary">Continue</button>
            <button class="zm-button secondary">Review</button>
            <button class="zm-button ghost">Dismiss</button>
            <button class="zm-button secondary focused">Focused</button>
            <button class="zm-button primary disabled">Disabled</button>
          </div>
        `, { center: true })}
      </section>
      <section class="section">${guidance("Use primary for the single next action in a decision surface.", "Put multiple filled buttons side by side.")}</section>
      <section class="section">${codePair("buttons")}</section>
    </article>
  `;
}

function pagePillsBadges() {
  return `
    <article class="page">
      ${pageHeader("Components", "Pills & Badges", "Small status treatments stay quiet and factual.")}
      <section class="section">
        ${preview("Status", "Live pill, neutral pill, and count badge", `
          <div class="pill-row">
            <span class="pill live">Live</span>
            <span class="pill">Focus mode</span>
            <span class="badge">4</span>
          </div>
        `, { center: true })}
      </section>
      <section class="section">
        <h3 class="section-title">States</h3>
        <div class="state-row">
          ${stateTile("Neutral", `<span class="pill">Focus mode</span>`)}
          ${stateTile("Live", `<span class="pill live">Live</span>`)}
          ${stateTile("Count", `<span class="badge">4</span>`)}
          ${stateTile("Disabled", `<span class="pill" style="opacity: 0.42;">Paused</span>`)}
        </div>
      </section>
      <section class="section">${guidance("Use badges for counts that support a decision.", "Use badges as reward loops or urgency markers.")}</section>
      <section class="section">${codePair("pills")}</section>
    </article>
  `;
}

function pageCards() {
  return `
    <article class="page">
      ${pageHeader("Components", "Cards", "Cards group related launcher settings and reference content with one quiet elevation token.")}
      <section class="section">
        ${preview("Raised card", "Generic content surface", `
          <div class="component-card">
            <span class="caption">Session</span>
            <strong>18 minutes saved</strong>
            <p>Today, ZenMode interrupted four distracting opens and helped complete two focus sessions.</p>
          </div>
        `, { center: true })}
      </section>
      <section class="section">
        <h3 class="section-title">States</h3>
        <div class="state-row">
          ${stateTile("Default", `<div class="component-card"><strong>Session</strong><p>18 minutes saved</p></div>`)}
          ${stateTile("Focused", `<div class="component-card focused"><strong>Session</strong><p>Review app opens</p></div>`)}
          ${stateTile("Raised", `<div class="component-card" style="box-shadow: var(--elevation-reflect);"><strong>Reflect</strong><p>Pause card only</p></div>`)}
          ${stateTile("Disabled", `<div class="component-card disabled"><strong>Unavailable</strong><p>Sync paused</p></div>`)}
        </div>
      </section>
      <section class="section">${guidance("Use cards for bounded content that needs separation from the surface.", "Nest cards inside cards or use glow to imply importance.")}</section>
      <section class="section">${codePair("cards")}</section>
    </article>
  `;
}

function pageNudgeBanner() {
  return `
    <article class="page">
      ${pageHeader("Components", "Nudge Banner", "Amber warns gently without borrowing alarm language from error systems.")}
      <section class="section">
        ${preview("Over-limit nudge", "Direct, non-scolding copy", nudgeBanner(), { center: true })}
      </section>
      <section class="section">
        <h3 class="section-title">States</h3>
        <div class="state-row">
          ${stateTile("Default", nudgeBanner())}
          ${stateTile("Focused", `<div class="nudge-banner focused"><div class="nudge-icon">!</div><div><strong>Limit is close</strong><span>Pause before opening.</span></div><button class="mini-button">Review</button></div>`)}
          ${stateTile("Resolved", `<div class="nudge-banner resolved"><div class="nudge-icon">!</div><div><strong>Limit reviewed</strong><span>Nudge dismissed for now.</span></div><button class="mini-button">Done</button></div>`)}
          ${stateTile("Compact", `<div class="nudge-banner"><div class="nudge-icon">!</div><div><strong>Near limit</strong><span>One breath first.</span></div></div>`)}
        </div>
      </section>
      <section class="section">${guidance("Say what happened and offer a next step.", "Use red, blame, streak loss, or shame language.")}</section>
      <section class="section">${codePair("nudge")}</section>
    </article>
  `;
}

function pageMilestoneNumeral() {
  return `
    <article class="page">
      ${pageHeader("Components", "Milestone Numeral", "A rare celebratory treatment for product milestones, never everyday launcher UI.")}
      <section class="section">
        ${preview("Celebration", "Ink to reflect-soft to deep gradient", milestone(), { center: true })}
      </section>
      <section class="section">
        <h3 class="section-title">States</h3>
        <div class="state-row">
          ${stateTile("Default", milestone())}
          ${stateTile("Compact", `<div class="milestone compact"><div class="milestone-number">50K</div><div class="milestone-label">stayed present</div></div>`)}
          ${stateTile("Dark Surface", `<div class="milestone"><div class="milestone-number">500K</div><div class="milestone-label">milestone only</div></div>`)}
          ${stateTile("Disabled", `<div class="milestone compact" style="opacity: 0.42;"><div class="milestone-number">--</div><div class="milestone-label">not for daily UI</div></div>`)}
        </div>
      </section>
      <section class="section">${guidance("Reserve for genuine milestones and recap moments.", "Use the gradient numeral for settings, counts, or routine app stats.")}</section>
      <section class="section">${codePair("milestone")}</section>
    </article>
  `;
}

function pageHomeGrid() {
  return `
    <article class="page">
      ${pageHeader("Patterns", "Home Grid", "The V2 launcher home from Figma, rebuilt as live components for dark and light modes.")}
      <section class="section">
        ${preview("V2 dark home", "Black and burgundy grid with expressive accountability cards", v2PhoneHome({ screen: "dark" }), { center: true, theme: "dark" })}
      </section>
      <section class="section">
        ${preview("V2 light home", "Cream and pink grid using the same component structure", v2PhoneHome({ screen: "light" }), { center: true, theme: "light" })}
      </section>
      <section class="section">
        <h3 class="section-title">Component Inventory</h3>
        <div class="grid three">
          <div class="info-tile"><h3>Stats cards</h3><p>High, medium, low, and inactive buddy states with mindfulness bars and love badges.</p></div>
          <div class="info-tile"><h3>Footer controls</h3><p>Settings, common search bar, and phone action align to the V2 green stroke.</p></div>
          <div class="info-tile"><h3>Grid icons</h3><p>App placeholders include locked, notification, and pinned variants.</p></div>
        </div>
      </section>
      <section class="section">${guidance("Use this page as the product home-screen reference for V2.", "Mix the older Zen Island card treatment into this V2 home surface without a clear product reason.")}</section>
    </article>
  `;
}

function pagePauseFlow() {
  const steps = [
    ["Tap", "The user chooses a distracting app."],
    ["Interrupt", "Zen Island appears at deliberate speed."],
    ["Reflect", "The ring completes and glow breathes slowly."],
    ["Resolve", "The user opens anyway or stays present."]
  ];

  return `
    <article class="page">
      ${pageHeader("Patterns", "Pause Flow", "A scrubbable walkthrough of the core interaction from tap to decision.")}
      <section class="section">
        ${preview("Pause sequence", "Use the slider or step buttons", `
          <div class="pause-flow-stage" data-pause-flow>
            <div class="phone">
              <div class="phone-status"><span>22:14</span><span>72%</span></div>
              <div class="home-top">
                <div class="home-title"><strong>Evening</strong><span>Browser requested</span></div>
                <div class="zen-island">
                  <div class="arc" style="--progress: 0%"><span data-flow-time>tap</span></div>
                  <div class="island-copy"><strong>Zen Island</strong><span data-flow-label>App requested</span></div>
                </div>
                <div class="app-grid">
                  ${appIcon("Phone", "P")}
                  ${appIcon("Browser", "B", "focused", "var(--color-accent-reflect)")}
                  ${appIcon("Messages", "M")}
                  ${appIcon("Camera", "C", "", "var(--color-warn-amber)")}
                </div>
              </div>
              ${dock()}
            </div>
            <div class="flow-panel">
              <div class="flow-steps">
                ${steps.map((step, index) => `
                  <div class="flow-step">
                    <div class="flow-step-index">${index + 1}</div>
                    <div><strong>${esc(step[0])}</strong><span>${esc(step[1])}</span></div>
                  </div>
                `).join("")}
              </div>
              <input class="range-full" type="range" min="0" max="3" step="1" value="0" data-flow-range />
              <div class="button-row">
                <button class="step-button" type="button" data-flow-prev>Previous</button>
                <button class="step-button" type="button" data-flow-next>Next</button>
              </div>
            </div>
          </div>
        `)}
      </section>
    </article>
  `;
}

function pageDeviceSync() {
  return `
    <article class="page">
      ${pageHeader("Patterns", "Device Sync", "The phone and companion puck change state together from one trigger.")}
      <section class="section">
        ${preview("Synchronized states", "Focus, reminder, and break share mode color across hardware and software", `
          <div class="device-sync" data-device-sync>
            <div class="phone">
              <div class="phone-status"><span>22:14</span><span>72%</span></div>
              <div class="home-top">
                <div class="home-title"><strong data-sync-mode>Focus</strong><span data-sync-phone>Deep work running</span></div>
                <div class="zen-island reflect">
                  <div class="arc" style="--progress: 100%"><span data-sync-time>82%</span></div>
                  <div class="island-copy"><strong>Zen Island</strong><span>Phone state follows the puck ring.</span></div>
                </div>
                ${statsView()}
              </div>
              ${dock()}
            </div>
            <div class="sync-panel">
              ${puck("focus", "2H 34M").replace("2H 34M", '<span data-sync-readout>2H 34M</span>')}
              <div class="sync-status">
                <span class="caption">Shared Trigger</span>
                <strong>Desk and launcher agree</strong>
                <span class="token-usage" data-sync-note>Ring and launcher both use color.accent.reflect.</span>
              </div>
              <div class="sync-mode-buttons">
                <button class="step-button" type="button" data-sync-set="focus">Focus</button>
                <button class="step-button" type="button" data-sync-set="reminder">Reminder</button>
                <button class="step-button" type="button" data-sync-set="break">Break</button>
              </div>
              <div class="device-note">The ambient ring is always subtle. Full brightness is reserved for the pause moment, matching the software motion rule.</div>
            </div>
          </div>
        `)}
      </section>
    </article>
  `;
}

function pageTokens() {
  const cssMap = Object.keys(TOKENS.semantic).map((name) => ({
    name: name.replaceAll(".", "/"),
    value: toVarName(name),
    primitive: "Identical alias",
    usage: TOKENS.semantic[name].usage
  }));
  const stateCards = Object.keys(TOKEN_CARD_STATES).map((state) => `
    <div class="token-card-state">
      <div class="token-card-state-head">
        <strong>${esc(state)}</strong>
        <span>${state === "default" ? "Ready" : TOKEN_CARD_STATES[state].action}</span>
      </div>
      ${tokenDownloadCard({ id: `token-state-${state}`, state, compact: true })}
    </div>
  `).join("");

  return `
    <article class="page">
      ${pageHeader("Reference", "Tokens", "Machine-readable design tokens for CSS, Compose, and Figma Variables.")}
      <section class="section">
        <div class="grid two">
          <div class="info-tile">
            <h3>Download JSON</h3>
            <p>The project root contains the source file used by this site.</p>
            <a class="download-link" href="/tokens.json" download>Download tokens.json</a>
          </div>
          <div class="info-tile">
            <h3>Figma import</h3>
            <p>Open Variables, import with a variables plugin, then keep collection names Primitives and Semantic.</p>
          </div>
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Token Package Utility</h3>
        <p class="section-copy">A quieter resource card for teams moving foundations between Figma, CSS, Android XML, and Compose.</p>
        <div class="token-card-documentation">
          ${tokenDownloadCard({ id: "token-package-docs" })}
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Component States</h3>
        <p class="section-copy">Default, downloading, completion, error, and disabled states use the same component shell. Hover, pressed, and keyboard focus are handled by CSS.</p>
        <div class="token-card-state-grid">
          ${stateCards}
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Before / After</h3>
        <div class="guidance">
          <div class="do-dont dont">
            <strong>Before</strong>
            <span>The first sidebar CTA used a large neon surface, heavy glow, and unclear graphic, so it competed with the navigation.</span>
          </div>
          <div class="do-dont do">
            <strong>After</strong>
            <span>The new card uses a neutral surface, compact token preview, wrapped format chips, distinct metadata, and one restrained primary action.</span>
          </div>
        </div>
      </section>
      <section class="section">
        <h3 class="section-title">Figma Variable Map</h3>
        ${tokenTable(cssMap)}
      </section>
      <section class="section">
        <h3 class="section-title">Copyable JSON</h3>
        ${codeBlock("JSON", JSON.stringify(TOKENS.figma, null, 2))}
      </section>
      <section class="section">
        ${codeBlock("Kotlin", `
object ZenColor {
    val surfaceBase = ColorToken("color/surface/base")
    val surfaceRaised = ColorToken("color/surface/raised")
    val accentReflect = ColorToken("color/accent/reflect")
    val warnAmber = ColorToken("color/warn/amber")
    val modeBreak = ColorToken("color/mode/break")
    val v2ActionPrimary = ColorToken("color/v2/action/primary")
    val v2GridRail = ColorToken("color/v2/grid-rail")
}`)}
      </section>
    </article>
  `;
}

function pageUnhookedDime() {
  return `
    <article class="page thesis-page">
      ${pageHeader("Interactive Thesis", "Unhooked Dime", "How we saved a billion dollars for you")}
      <section class="section">
        <div class="thesis-placeholder">
          <p class="eyebrow">Coming Soon</p>
          <h3>Interactive thesis coming soon</h3>
          <p>An editorial walkthrough on how attention-driven products convert time into revenue, and how ZenMode helps people take that time back.</p>
          <a class="download-link" href="/" data-link>Return to overview</a>
        </div>
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

async function boot() {
  const redirected = sessionStorage.getItem("zm-spa-redirect");
  if (redirected) {
    sessionStorage.removeItem("zm-spa-redirect");
    history.replaceState({}, "", redirected);
  }

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
      return;
    }

    const previewTheme = event.target.closest("[data-preview-theme-button]");
    if (previewTheme) {
      const target = previewTheme.closest(".preview");
      setPreviewTheme(target, previewTheme.dataset.previewThemeButton);
    }
  });

  window.addEventListener("popstate", renderRoute);
}

boot();
