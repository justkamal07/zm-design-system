# ZenMode Design System MCP

This MCP server exposes the ZenMode `Zenmode_V2` design tokens, foundations (typography, color,
icons), and site routes to MCP clients. It is dependency-free (uses only Node's `node:*` built-ins)
and runs over stdio.

## Run it

From the project root:

```sh
node mcp/zenmode-mcp.mjs
```

or via the npm script:

```sh
npm run mcp
```

No output after launch is normal — MCP servers wait for a client to send JSON-RPC messages over
stdin.

## Client config

Point any MCP-compatible client at the server file with `node`:

```json
{
  "mcpServers": {
    "zenmode-design-system": {
      "command": "node",
      "args": ["mcp/zenmode-mcp.mjs"],
      "cwd": "/absolute/path/to/zm-design-system"
    }
  }
}
```

Or use the bundled launcher script, which resolves the project root for you:

```json
{
  "mcpServers": {
    "zenmode-design-system": {
      "command": "/absolute/path/to/zm-design-system/run-zenmode-mcp.sh"
    }
  }
}
```

## Resources

- `zenmode://tokens` — the full `tokens.json` source
- `zenmode://tokens/semantic` — the Semantic Tokens (Light mode) collection (Backgrounds, Surfaces & Borders, Typography, Actions)
- `zenmode://tokens/global` — the Global Tokens collection
- `zenmode://tokens/css` — generated CSS custom properties for light and dark themes
- `zenmode://foundations/typography` — Cabinet Grotesque, Bricolage Grotesque, Reddit Mono specimens
- `zenmode://foundations/colors` — Zen Greens, Ink & Neutrals, Status & Buddy Faces swatches
- `zenmode://foundations/icons` — the 18-glyph icon set
- `zenmode://routes` — site route metadata
- `zenmode://readme` — this guide, in-band

## Tools

- `list_tokens({ collection, group })` — list tokens from `semantic` or `global`, optionally filtered by semantic group
- `get_token({ name })` — return one token by exact name from either collection
- `list_icons()` — list the icon set
- `search_design_system({ query, limit })` — search tokens, foundations, routes, and source files
- `get_route({ path })` — return metadata for a local design-system route

## Example prompts

- "List every token in the Actions (buttons & icons) group."
- "What's the dark-mode value of border-focus?"
- "Search the design system for zen-glow."
- "What icons are in the ZenMode set?"
