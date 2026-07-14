import test from "node:test";
import assert from "node:assert/strict";
import { unhookedDimeFlag } from "../src/unhookedDimeFlag.js";

test("renders the Unhooked Dime sticky flag content and controls", () => {
  const html = unhookedDimeFlag();

  assert.match(html, /aria-label="Unhooked Dime interactive thesis"/);
  assert.match(html, /INTERACTIVE THESIS · 01/i);
  assert.match(html, /Unhooked Dime/);
  assert.match(html, /How we saved a billion dollars for you/);
  assert.match(html, /href="\/unhooked-dime"/);
  assert.match(html, /data-unhooked-dime-dismiss/);
});
