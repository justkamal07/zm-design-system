import test from "node:test";
import assert from "node:assert/strict";
import { callTool, handleRequest } from "../mcp/zenmode-mcp.mjs";

test("MCP initialize advertises resources and tools", async () => {
  const result = await handleRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05" }
  });

  assert.equal(result.serverInfo.name, "zenmode-design-system-mcp");
  assert.ok(result.capabilities.resources);
  assert.ok(result.capabilities.tools);
});

test("MCP lists and reads ZenMode resources", async () => {
  const listed = await handleRequest({ jsonrpc: "2.0", id: 1, method: "resources/list" });
  assert.ok(listed.resources.some((resource) => resource.uri === "zenmode://tokens"));
  assert.ok(listed.resources.some((resource) => resource.uri === "zenmode://components/token-download-card"));

  const read = await handleRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "resources/read",
    params: { uri: "zenmode://routes" }
  });
  assert.ok(read.contents[0].text.includes("/patterns/home-grid"));
});

test("MCP token tools return themed token data", async () => {
  const result = await callTool("get_token", { name: "color.accent.reflect", theme: "dark" });
  const payload = JSON.parse(result.content[0].text);

  assert.equal(payload.name, "color.accent.reflect");
  assert.equal(payload.theme, "dark");
  assert.equal(payload.value, "#2FE28F");
});

test("MCP can render the condensed token card", async () => {
  const result = await callTool("render_token_card", { compact: true, condensed: true });
  const html = result.content[0].text;

  assert.match(html, /token-download-card compact condensed/);
  assert.match(html, /Download token package/);
  assert.match(html, /Download all/);
});

test("MCP search finds sidebar token-card source", async () => {
  const result = await callTool("search_design_system", { query: "sidebar-cta", limit: 5 });
  const matches = JSON.parse(result.content[0].text);

  assert.ok(matches.some((match) => match.type === "source" && match.file === "styles.css"));
});
