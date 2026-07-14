import test from "node:test";
import assert from "node:assert/strict";
import { TOKEN_PACKAGE_META, tokenDownloadCard } from "../src/tokenDownloadCard.js";

test("renders the default token package utility card", () => {
  const html = tokenDownloadCard({ id: "test-card" });

  assert.match(html, /Download token package/);
  assert.match(html, /Download all/);
  assert.match(html, /href="\/tokens"/);
  assert.match(html, /data-token-card-state="default"/);
  for (const format of TOKEN_PACKAGE_META.formats) {
    assert.match(html, new RegExp(`>${format}<`));
  }
});

test("renders downloading, complete, error, and disabled states", () => {
  assert.match(tokenDownloadCard({ state: "downloading" }), /Preparing package/);
  assert.match(tokenDownloadCard({ state: "complete" }), /Downloaded/);
  assert.match(tokenDownloadCard({ state: "error" }), /Could not prepare package/);
  assert.match(tokenDownloadCard({ state: "error" }), />Retry</);
  assert.match(tokenDownloadCard({ state: "disabled" }), /disabled aria-disabled="true"/);
});

test("keeps metadata as structured source information", () => {
  const html = tokenDownloadCard();

  assert.match(html, /<dt class="sr-only">Version<\/dt><dd>v2\.1<\/dd>/);
  assert.match(html, /<dt class="sr-only">Updated<\/dt><dd>Updated recently<\/dd>/);
  assert.match(html, /<dt>Source:<\/dt>/);
  assert.match(html, /https:\/\/github\.com\/ThammanaSrinivas\/zenmode/);
});
