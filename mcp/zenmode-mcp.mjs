#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEXT_ENCODER = new TextEncoder();

const ROUTES = [
  { path: "/", title: "Overview", group: "Overview" },
  { path: "/foundations/typography", title: "Typography", group: "Foundations" },
  { path: "/foundations/color", title: "Color", group: "Foundations" },
  { path: "/foundations/icons", title: "Icons", group: "Foundations" },
  { path: "/components", title: "Components", group: "Components", status: "empty" },
  { path: "/tokens", title: "Tokens", group: "Reference" }
];

const RESOURCE_INDEX = [
  {
    uri: "zenmode://tokens",
    name: "ZenMode tokens.json",
    description: "Complete Zenmode_V2 token source: global tokens, semantic light/dark tokens, and typography/color/icon foundations.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://tokens/semantic",
    name: "Semantic Tokens (Light mode) collection",
    description: "Semantic tokens grouped by Backgrounds, Surfaces & Borders, Typography, and Actions, with light/dark values.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://tokens/global",
    name: "Global Tokens collection",
    description: "Raw global color values (white, grey scale, black, zen greens).",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://tokens/css",
    name: "CSS custom property map",
    description: "CSS variable declarations generated from the semantic token collection for light and dark themes.",
    mimeType: "text/css"
  },
  {
    uri: "zenmode://foundations/typography",
    name: "Typography foundation",
    description: "Cabinet Grotesque, Bricolage Grotesque, and Reddit Mono specimens and weights.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://foundations/colors",
    name: "Color foundation",
    description: "Zen Greens, Ink & Neutrals, and Status & Buddy Faces swatch groups.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://foundations/icons",
    name: "Icon foundation",
    description: "The 18-glyph ZenMode icon set (currentColor, size prop).",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://routes",
    name: "Design-system routes",
    description: "All local site routes exposed by the ZenMode design-system SPA.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://readme",
    name: "MCP usage notes",
    description: "How to connect and query this local ZenMode MCP server.",
    mimeType: "text/markdown"
  }
];

export async function loadTokens() {
  const raw = await readFile(path.join(ROOT, "tokens.json"), "utf8");
  return JSON.parse(raw);
}

function textContent(text) {
  return [{ type: "text", text }];
}

function jsonText(value) {
  return JSON.stringify(value, null, 2);
}

function toVarName(tokenName) {
  return `--${tokenName.replaceAll("&", "-").replaceAll(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`;
}

async function cssVariableMap() {
  const tokens = await loadTokens();
  const flat = tokens.collections.semantic.groups.flatMap((group) => group.tokens);
  const light = flat.map((token) => `  ${toVarName(token.name)}: ${token.lightHex};`).join("\n");
  const dark = flat.map((token) => `  ${toVarName(token.name)}: ${token.darkHex};`).join("\n");

  return `:root[data-theme="light"] {\n${light}\n}\n\n:root[data-theme="dark"] {\n${dark}\n}\n`;
}

async function readResource(uri) {
  const tokens = await loadTokens();

  if (uri === "zenmode://tokens") return jsonText(tokens);
  if (uri === "zenmode://tokens/semantic") return jsonText(tokens.collections.semantic);
  if (uri === "zenmode://tokens/global") return jsonText(tokens.collections.global);
  if (uri === "zenmode://tokens/css") return cssVariableMap();
  if (uri === "zenmode://foundations/typography") return jsonText(tokens.foundations.typography);
  if (uri === "zenmode://foundations/colors") return jsonText(tokens.foundations.colors);
  if (uri === "zenmode://foundations/icons") return jsonText(tokens.foundations.icons);
  if (uri === "zenmode://routes") return jsonText(ROUTES);
  if (uri === "zenmode://readme") {
    return [
      "# ZenMode MCP",
      "",
      "This local MCP server exposes the Zenmode_V2 design-system tokens, foundations, and routes.",
      "",
      "Start command (from the project root):",
      "",
      "```sh",
      "node mcp/zenmode-mcp.mjs",
      "```",
      "",
      "Useful tools: `list_tokens`, `get_token`, `list_icons`, `search_design_system`, and `get_route`."
    ].join("\n");
  }

  throw new Error(`Unknown resource: ${uri}`);
}

function listResources() {
  return { resources: RESOURCE_INDEX };
}

function listTools() {
  return {
    tools: [
      {
        name: "list_tokens",
        description: "List ZenMode design tokens from the Global Tokens or Semantic Tokens (Light mode) collection, optionally filtered by group.",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string", enum: ["semantic", "global"], default: "semantic" },
            group: { type: "string", description: "Optional semantic group filter: Backgrounds, Surfaces & Borders, Typography, or Actions (buttons & icons)." }
          },
          additionalProperties: false
        }
      },
      {
        name: "get_token",
        description: "Get a single token by exact name from either the global or semantic collection.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" }
          },
          required: ["name"],
          additionalProperties: false
        }
      },
      {
        name: "list_icons",
        description: "List the 18-glyph ZenMode icon set.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false }
      },
      {
        name: "search_design_system",
        description: "Search tokens, foundations, routes, and core source files for a ZenMode design-system term.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            limit: { type: "number", default: 12 }
          },
          required: ["query"],
          additionalProperties: false
        }
      },
      {
        name: "get_route",
        description: "Return route metadata for a local design-system page.",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Route path, for example /foundations/color." }
          },
          required: ["path"],
          additionalProperties: false
        }
      }
    ]
  };
}

export async function callTool(name, args = {}) {
  const tokens = await loadTokens();

  if (name === "list_tokens") {
    const collection = args.collection === "global" ? "global" : "semantic";
    if (collection === "global") {
      return { content: textContent(jsonText(tokens.collections.global.tokens)) };
    }
    const groups = tokens.collections.semantic.groups.filter((group) => !args.group || group.name === args.group);
    return { content: textContent(jsonText(groups)) };
  }

  if (name === "get_token") {
    const query = String(args.name || "").toLowerCase();
    const global = tokens.collections.global.tokens.find((token) => token.name.toLowerCase() === query);
    if (global) return { content: textContent(jsonText({ collection: "global", ...global })) };

    for (const group of tokens.collections.semantic.groups) {
      const semantic = group.tokens.find((token) => token.name.toLowerCase() === query);
      if (semantic) return { content: textContent(jsonText({ collection: "semantic", group: group.name, ...semantic })) };
    }

    throw new Error(`Unknown token: ${args.name}`);
  }

  if (name === "list_icons") {
    return { content: textContent(jsonText(tokens.foundations.icons)) };
  }

  if (name === "search_design_system") {
    const query = String(args.query || "").trim().toLowerCase();
    if (!query) throw new Error("query is required");
    const limit = Number.isFinite(args.limit) ? Math.max(1, Math.min(50, args.limit)) : 12;
    const files = ["src/app.js", "src/icons.js", "styles.css", "tokens.json"];
    const matches = [];

    for (const token of tokens.collections.global.tokens) {
      const haystack = `${token.name} ${token.value}`.toLowerCase();
      if (haystack.includes(query)) matches.push({ type: "token", collection: "global", ...token });
    }
    for (const group of tokens.collections.semantic.groups) {
      for (const token of group.tokens) {
        const haystack = `${token.name} ${group.name} ${JSON.stringify(token)}`.toLowerCase();
        if (haystack.includes(query)) matches.push({ type: "token", collection: "semantic", group: group.name, ...token });
      }
    }
    for (const route of ROUTES) {
      const haystack = `${route.path} ${route.title} ${route.group}`.toLowerCase();
      if (haystack.includes(query)) matches.push({ type: "route", ...route });
    }
    for (const file of files) {
      const source = await readFile(path.join(ROOT, file), "utf8");
      source.split("\n").forEach((line, index) => {
        if (line.toLowerCase().includes(query)) {
          matches.push({ type: "source", file, line: index + 1, text: line.trim() });
        }
      });
    }

    return { content: textContent(jsonText(matches.slice(0, limit))) };
  }

  if (name === "get_route") {
    const route = ROUTES.find((item) => item.path === args.path);
    if (!route) throw new Error(`Unknown route: ${args.path}`);
    return { content: textContent(jsonText(route)) };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export async function handleRequest(message) {
  if (message.method === "initialize") {
    return {
      protocolVersion: message.params?.protocolVersion || "2024-11-05",
      capabilities: {
        resources: {},
        tools: {}
      },
      serverInfo: {
        name: "zenmode-design-system-mcp",
        version: "0.2.0"
      }
    };
  }

  if (message.method === "ping") return {};
  if (message.method === "resources/list") return listResources();
  if (message.method === "resources/read") {
    const uri = message.params?.uri;
    const resource = RESOURCE_INDEX.find((item) => item.uri === uri);
    const text = await readResource(uri);
    return {
      contents: [{
        uri,
        mimeType: resource?.mimeType || "text/plain",
        text
      }]
    };
  }
  if (message.method === "tools/list") return listTools();
  if (message.method === "tools/call") return callTool(message.params?.name, message.params?.arguments || {});
  if (message.method === "prompts/list") return { prompts: [] };
  if (message.method === "notifications/initialized") return undefined;

  throw new Error(`Unsupported method: ${message.method}`);
}

function encodeResponse(id, result, error) {
  const response = error
    ? { jsonrpc: "2.0", id, error: { code: -32000, message: error.message } }
    : { jsonrpc: "2.0", id, result };
  return `${JSON.stringify(response)}\n`;
}

async function dispatch(message) {
  if (!message || message.jsonrpc !== "2.0" || !message.method) return;
  try {
    const result = await handleRequest(message);
    if (message.id !== undefined && result !== undefined) {
      process.stdout.write(encodeResponse(message.id, result));
    }
  } catch (error) {
    if (message.id !== undefined) {
      process.stdout.write(encodeResponse(message.id, undefined, error));
    }
  }
}

function parseMessagesFromBuffer(buffer) {
  const messages = [];
  let remaining = buffer;

  while (remaining.startsWith("Content-Length:")) {
    const headerEnd = remaining.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;
    const header = remaining.slice(0, headerEnd);
    const length = Number(header.match(/Content-Length:\s*(\d+)/i)?.[1]);
    if (!Number.isFinite(length)) break;
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;
    if (TEXT_ENCODER.encode(remaining.slice(bodyStart)).length < length) break;
    const body = remaining.slice(bodyStart, bodyEnd);
    messages.push(JSON.parse(body));
    remaining = remaining.slice(bodyEnd);
  }

  if (messages.length) return { messages, remaining };

  const lines = remaining.split(/\r?\n/);
  remaining = lines.pop() || "";
  for (const line of lines) {
    if (line.trim()) messages.push(JSON.parse(line));
  }
  return { messages, remaining };
}

export function startServer() {
  process.stdin.setEncoding("utf8");
  let buffer = "";
  process.stdin.on("data", async (chunk) => {
    buffer += chunk;
    try {
      const parsed = parseMessagesFromBuffer(buffer);
      buffer = parsed.remaining;
      for (const message of parsed.messages) {
        await dispatch(message);
      }
    } catch (error) {
      process.stderr.write(`ZenMode MCP parse error: ${error.message}\n`);
      buffer = "";
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
