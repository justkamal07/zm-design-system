export const TOKEN_PACKAGE_META = {
  version: "v2.1",
  updated: "Updated recently",
  sourceLabel: "GitHub",
  sourceHref: "https://github.com/ThammanaSrinivas/zenmode",
  formats: ["JSON", "CSS", "TypeScript", "Figma", "Android", "Compose"]
};

export const TOKEN_CARD_STATES = {
  default: {
    action: "Download all",
    icon: "packageDownload",
    status: "Package includes primitives, semantic aliases, and platform notes.",
    tone: "neutral"
  },
  downloading: {
    action: "Preparing package",
    icon: "loader",
    status: "Preparing package",
    tone: "progress"
  },
  complete: {
    action: "Downloaded",
    icon: "check",
    status: "Downloaded",
    tone: "success"
  },
  error: {
    action: "Retry",
    icon: "alert",
    status: "Could not prepare package. Try again.",
    tone: "error"
  },
  disabled: {
    action: "Download all",
    icon: "packageDownload",
    status: "Token package is unavailable in this state.",
    tone: "disabled"
  }
};

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function tokenIcon(name, className = "token-card-icon") {
  const attrs = `class="${className}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const paths = {
    packageDownload: '<path d="m16 16-4 4-4-4"></path><path d="M12 20V10"></path><path d="m21 8-9-5-9 5 9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path>',
    external: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    loader: '<path d="M21 12a9 9 0 1 1-6.2-8.56"></path>',
    alert: '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1"></path><path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1"></path>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2a10 10 0 0 0 0 20h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2a8 8 0 0 0 0-16Z"></path>'
  };

  return `<svg ${attrs}>${paths[name] || paths.packageDownload}</svg>`;
}

function tokenPreview() {
  return `
    <div class="token-card-preview" aria-hidden="true">
      <div class="token-preview-row token-preview-swatches">
        <span style="--token-preview-color: #EEF2F0"></span>
        <span style="--token-preview-color: #2FE28F"></span>
        <span style="--token-preview-color: #1F7A54"></span>
      </div>
      <div class="token-preview-row token-preview-samples">
        <span class="radius-sample small"></span>
        <span class="radius-sample large"></span>
        <span class="type-sample">Aa</span>
        <span class="code-sample">${tokenIcon("braces", "token-preview-icon")}</span>
      </div>
    </div>
  `;
}

export function tokenDownloadCard(options = {}) {
  const id = options.id || "token-download-card";
  const stateName = TOKEN_CARD_STATES[options.state] ? options.state : "default";
  const state = TOKEN_CARD_STATES[stateName];
  const compact = options.compact ? " compact" : "";
  const condensed = options.condensed ? " condensed" : "";
  const className = options.className ? ` ${escapeHtml(options.className)}` : "";
  const disabled = stateName === "disabled" || options.disabled;
  const labelledBy = `${id}-title`;
  const describedBy = `${id}-description ${id}-status`;

  return `
    <article class="token-download-card${compact}${condensed}${className}" data-token-download-card data-token-card-state="${stateName}" aria-labelledby="${labelledBy}" aria-describedby="${describedBy}">
      <div class="token-card-intro">
        ${tokenPreview()}
        <div class="token-card-copy">
          <p class="token-card-eyebrow">Design tokens</p>
          <h3 id="${labelledBy}" class="token-card-title">Download token package</h3>
          <p id="${id}-description" class="token-card-description">Use the same foundations across Figma, CSS, Tailwind, Android XML, and Jetpack Compose.</p>
        </div>
      </div>
      <div class="token-card-formats" aria-label="Included formats">
        ${TOKEN_PACKAGE_META.formats.map((format) => `<span class="token-card-chip">${escapeHtml(format)}</span>`).join("")}
      </div>
      <div class="token-card-actions">
        <button class="token-card-button" type="button" data-token-download-action aria-label="Download all ZenMode design tokens" ${disabled ? "disabled aria-disabled=\"true\"" : ""}>
          <span data-token-download-icon>${tokenIcon(state.icon)}</span>
          <span data-token-download-label>${escapeHtml(state.action)}</span>
        </button>
        <a class="token-card-secondary" href="/tokens" data-link>View tokens</a>
      </div>
      <p id="${id}-status" class="token-card-status" data-token-download-status data-status-tone="${state.tone}" aria-live="polite">${escapeHtml(state.status)}</p>
      <dl class="token-card-meta" aria-label="Token package metadata">
        <div><dt class="sr-only">Version</dt><dd>${escapeHtml(TOKEN_PACKAGE_META.version)}</dd></div>
        <div><dt class="sr-only">Updated</dt><dd>${escapeHtml(TOKEN_PACKAGE_META.updated)}</dd></div>
        <div>
          <dt>Source:</dt>
          <dd><a href="${escapeHtml(TOKEN_PACKAGE_META.sourceHref)}" target="_blank" rel="noreferrer">${escapeHtml(TOKEN_PACKAGE_META.sourceLabel)} ${tokenIcon("external", "token-card-meta-icon")}</a></dd>
        </div>
      </dl>
    </article>
  `;
}
