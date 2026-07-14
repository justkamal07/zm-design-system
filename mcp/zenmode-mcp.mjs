#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOKEN_CARD_STATES, TOKEN_PACKAGE_META, tokenDownloadCard } from "../src/tokenDownloadCard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEXT_ENCODER = new TextEncoder();

const ROUTES = [
  { path: "/", title: "Overview", group: "Overview" },
  { path: "/foundations/color", title: "Color", group: "Foundations" },
  { path: "/foundations/typography", title: "Typography", group: "Foundations" },
  { path: "/foundations/spacing", title: "Spacing", group: "Foundations" },
  { path: "/foundations/motion", title: "Motion", group: "Foundations" },
  { path: "/foundations/elevation", title: "Elevation", group: "Foundations" },
  { path: "/foundations/device-modes", title: "Device Modes", group: "Foundations" },
  { path: "/components/zen-island", title: "Zen Island", group: "Components" },
  { path: "/components/app-icon", title: "App Icon", group: "Components" },
  { path: "/components/v2-stats-card", title: "V2 Stats Card", group: "Components" },
  { path: "/components/v2-interactions", title: "V2 Interactions", group: "Components" },
  { path: "/components/dock", title: "Dock", group: "Components" },
  { path: "/components/buttons", title: "Buttons", group: "Components" },
  { path: "/components/pills-badges", title: "Pills & Badges", group: "Components" },
  { path: "/components/cards", title: "Cards", group: "Components" },
  { path: "/components/nudge-banner", title: "Nudge Banner", group: "Components" },
  { path: "/components/milestone-numeral", title: "Milestone Numeral", group: "Components" },
  { path: "/patterns/home-grid", title: "Home Grid", group: "Patterns" },
  { path: "/patterns/pause-flow", title: "Pause Flow", group: "Patterns" },
  { path: "/patterns/device-sync", title: "Device Sync", group: "Patterns" },
  { path: "/tokens", title: "Tokens", group: "Reference" },
  { path: "/unhooked-dime", title: "Unhooked Dime", group: "Reference" }
];

const RESOURCE_INDEX = [
  {
    uri: "zenmode://tokens",
    name: "ZenMode tokens.json",
    description: "Complete token source with primitives, semantic aliases, motion, type, and Figma mappings.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://tokens/semantic",
    name: "Semantic token table",
    description: "Semantic tokens grouped by name with light/dark values and usage notes.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://tokens/css",
    name: "CSS custom property map",
    description: "CSS variable names generated from semantic token names.",
    mimeType: "text/css"
  },
  {
    uri: "zenmode://routes",
    name: "Design-system routes",
    description: "All local site routes exposed by the ZenMode design-system SPA.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://components/token-download-card",
    name: "Download token card component",
    description: "Reusable token package utility card HTML states and metadata.",
    mimeType: "application/json"
  },
  {
    uri: "zenmode://styles/sidebar-token-card",
    name: "Sidebar token-card CSS",
    description: "Relevant CSS rules for the responsive sticky sidebar CTA.",
    mimeType: "text/css"
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

function normalizeTheme(theme) {
  return theme === "light" ? "light" : theme === "dark" ? "dark" : undefined;
}

function tokenToCssName(tokenName) {
  return `--${tokenName.replaceAll(".", "-")}`;
}

async function cssVariableMap() {
  const tokens = await loadTokens();
  const dark = Object.entries(tokens.semantic)
    .map(([name, value]) => `  ${tokenToCssName(name)}: ${value.dark};`)
    .join("\n");
  const light = Object.entries(tokens.semantic)
    .map(([name, value]) => `  ${tokenToCssName(name)}: ${value.light};`)
    .join("\n");

  return `:root[data-theme="dark"] {\n${dark}\n}\n\n:root[data-theme="light"] {\n${light}\n}\n`;
}

async function extractSidebarTokenCss() {
  const css = await readFile(path.join(ROOT, "styles.css"), "utf8");
  const selectors = [
    ".shell",
    ".sidebar",
    ".sidebar-nav",
    ".sidebar-cta",
    ".token-download-card",
    ".token-card-intro",
    ".token-card-preview",
    ".token-download-card.condensed",
    "@media (max-width: 820px)",
    "@media (max-width: 620px)"
  ];

  const blocks = [];
  for (const selector of selectors) {
    const index = css.indexOf(selector);
    if (index === -1) continue;
    const next = css.indexOf("\n\n", index + selector.length);
    blocks.push(css.slice(index, next === -1 ? css.length : next));
  }
  return blocks.join("\n\n");
}

async function readResource(uri) {
  const tokens = await loadTokens();

  if (uri === "zenmode://tokens") return jsonText(tokens);
  if (uri === "zenmode://tokens/semantic") return jsonText(tokens.semantic);
  if (uri === "zenmode://tokens/css") return cssVariableMap();
  if (uri === "zenmode://routes") return jsonText(ROUTES);
  if (uri === "zenmode://components/token-download-card") {
    return jsonText({
      meta: TOKEN_PACKAGE_META,
      states: TOKEN_CARD_STATES,
      examples: {
        default: tokenDownloadCard({ id: "mcp-token-card" }),
        condensedSidebar: tokenDownloadCard({
          id: "mcp-sidebar-token-card",
          compact: true,
          condensed: true,
          className: "sidebar-cta"
        })
      }
    });
  }
  if (uri === "zenmode://styles/sidebar-token-card") return extractSidebarTokenCss();
  if (uri === "zenmode://readme") {
    return [
      "# ZenMode MCP",
      "",
      "This local MCP server exposes the ZenMode design-system tokens, routes, and reusable token-download component.",
      "",
      "Start command:",
      "",
      "```sh",
      "node mcp/zenmode-mcp.mjs",
      "```",
      "",
      "Useful tools: `list_tokens`, `get_token`, `search_design_system`, `get_route`, and `render_token_card`."
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
        description: "List ZenMode design tokens by section, theme, and prefix.",
        inputSchema: {
          type: "object",
          properties: {
            section: { type: "string", enum: ["semantic", "primitives", "motion", "type", "figma"], default: "semantic" },
            theme: { type: "string", enum: ["light", "dark"], description: "Optional theme value selector for semantic tokens." },
            prefix: { type: "string", description: "Optional token name prefix filter, such as color.v2 or color.accent." }
          },
          additionalProperties: false
        }
      },
      {
        name: "get_token",
        description: "Get a single primitive or semantic token by exact name.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            theme: { type: "string", enum: ["light", "dark"], description: "Optional theme value selector for semantic tokens." }
          },
          required: ["name"],
          additionalProperties: false
        }
      },
      {
        name: "search_design_system",
        description: "Search tokens, routes, and core source files for a ZenMode design-system term.",
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
            path: { type: "string", description: "Route path, for example /patterns/home-grid." }
          },
          required: ["path"],
          additionalProperties: false
        }
      },
      {
        name: "render_token_card",
        description: "Render the reusable token-download card HTML for a state and density.",
        inputSchema: {
          type: "object",
          properties: {
            state: { type: "string", enum: Object.keys(TOKEN_CARD_STATES), default: "default" },
            compact: { type: "boolean", default: false },
            condensed: { type: "boolean", default: false }
          },
          additionalProperties: false
        }
      }
    ]
  };
}

export async function callTool(name, args = {}) {
  const tokens = await loadTokens();

  if (name === "list_tokens") {
    const section = args.section || "semantic";
    const theme = normalizeTheme(args.theme);
    const source = tokens[section];
    if (!source) throw new Error(`Unknown token section: ${section}`);

    const entries = Object.entries(source)
      .filter(([tokenName]) => !args.prefix || tokenName.startsWith(args.prefix))
      .map(([tokenName, value]) => {
        if (theme && value && typeof value === "object" && "light" in value && "dark" in value) {
          return [tokenName, { value: value[theme], usage: value.usage, primitive: value.primitive?.[theme] }];
        }
        return [tokenName, value];
      });

    return { content: textContent(jsonText(Object.fromEntries(entries))) };
  }

  if (name === "get_token") {
    const theme = normalizeTheme(args.theme);
    const semantic = tokens.semantic[args.name];
    const primitive = tokens.primitives[args.name];
    if (!semantic && !primitive) throw new Error(`Unknown token: ${args.name}`);

    const value = semantic && theme
      ? { name: args.name, theme, value: semantic[theme], usage: semantic.usage, primitive: semantic.primitive?.[theme] }
      : { name: args.name, value: semantic || primitive };
    return { content: textContent(jsonText(value)) };
  }

  if (name === "search_design_system") {
    const query = String(args.query || "").trim().toLowerCase();
    if (!query) throw new Error("query is required");
    const limit = Number.isFinite(args.limit) ? Math.max(1, Math.min(50, args.limit)) : 12;
    const files = ["src/app.js", "src/tokenDownloadCard.js", "styles.css", "tokens.json"];
    const matches = [];

    for (const [tokenName, value] of Object.entries(tokens.semantic)) {
      const haystack = `${tokenName} ${JSON.stringify(value)}`.toLowerCase();
      if (haystack.includes(query)) matches.push({ type: "token", name: tokenName, value });
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

  if (name === "render_token_card") {
    const state = TOKEN_CARD_STATES[args.state] ? args.state : "default";
    return {
      content: textContent(tokenDownloadCard({
        id: "mcp-rendered-token-card",
        state,
        compact: Boolean(args.compact),
        condensed: Boolean(args.condensed)
      }))
    };
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
        version: "0.1.0"
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
