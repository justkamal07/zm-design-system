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
  assert.ok(listed.resources.some((resource) => resource.uri === "zenmode://tokens/global"));

  const read = await handleRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "resources/read",
    params: { uri: "zenmode://routes" }
  });
  assert.ok(read.contents[0].text.includes("/foundations/color"));
});

test("MCP lists tokens by collection and group", async () => {
  const global = await callTool("list_tokens", { collection: "global" });
  const globalTokens = JSON.parse(global.content[0].text);
  assert.ok(globalTokens.some((token) => token.name === "Color-zen-base"));

  const semantic = await callTool("list_tokens", { collection: "semantic", group: "Actions (buttons & icons)" });
  const groups = JSON.parse(semantic.content[0].text);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].tokens.length, 3);
});

test("MCP get_token returns light and dark values for a semantic token", async () => {
  const result = await callTool("get_token", { name: "border-focus" });
  const payload = JSON.parse(result.content[0].text);

  assert.equal(payload.collection, "semantic");
  assert.equal(payload.lightHex, "#00C700");
  assert.equal(payload.darkHex, "#24FF24");
});

test("MCP get_token returns a global token by name", async () => {
  const result = await callTool("get_token", { name: "Color-zen-glow" });
  const payload = JSON.parse(result.content[0].text);

  assert.equal(payload.collection, "global");
  assert.equal(payload.value, "#24FF24");
});

test("MCP lists the icon set", async () => {
  const result = await callTool("list_icons", {});
  const payload = JSON.parse(result.content[0].text);

  assert.equal(payload.names.length, 18);
  assert.ok(payload.names.includes("IconHome"));
});

test("MCP search finds tokens and source references", async () => {
  const result = await callTool("search_design_system", { query: "zen-glow", limit: 20 });
  const matches = JSON.parse(result.content[0].text);

  assert.ok(matches.some((match) => match.type === "token"));
});
