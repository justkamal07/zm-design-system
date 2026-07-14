# ZenMode Design System MCP

This MCP server exposes the local ZenMode design-system site to MCP clients.

It is dependency-free and runs over stdio.

From anywhere on this Mac, run:

```sh
"/Users/kamalraajsenthilkumar/Documents/ZenMode Design System/run-zenmode-mcp.sh"
```

Or run the server file directly with the bundled Node runtime:

```sh
"/Users/kamalraajsenthilkumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" "/Users/kamalraajsenthilkumar/Documents/ZenMode Design System/mcp/zenmode-mcp.mjs"
```

If you have changed into the project folder first, this also works:

```sh
cd "/Users/kamalraajsenthilkumar/Documents/ZenMode Design System"
"/Users/kamalraajsenthilkumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" mcp/zenmode-mcp.mjs
```

No output after launch is normal. MCP servers wait for an MCP client to send JSON-RPC messages over stdio.

## Client Config

Use this command in an MCP-compatible client:

```json
{
  "mcpServers": {
    "zenmode-design-system": {
      "command": "/Users/kamalraajsenthilkumar/Documents/ZenMode Design System/run-zenmode-mcp.sh",
      "args": []
    }
  }
}
```

If your client does not allow a shell script command, use the bundled Node runtime directly:

```json
{
  "mcpServers": {
    "zenmode-design-system": {
      "command": "/Users/kamalraajsenthilkumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node",
      "args": [
        "/Users/kamalraajsenthilkumar/Documents/ZenMode Design System/mcp/zenmode-mcp.mjs"
      ]
    }
  }
}
```

If your environment has `node` on `PATH`, this shorter project-relative command also works only when the client runs from the project folder:

```json
{
  "mcpServers": {
    "zenmode-design-system": {
      "command": "node",
      "args": [
        "mcp/zenmode-mcp.mjs"
      ]
    }
  }
}
```

## Resources

- `zenmode://tokens`
- `zenmode://tokens/semantic`
- `zenmode://tokens/css`
- `zenmode://routes`
- `zenmode://components/token-download-card`
- `zenmode://styles/sidebar-token-card`
- `zenmode://readme`

## Tools

- `list_tokens`: list tokens by section, theme, and prefix.
- `get_token`: return one primitive or semantic token by exact name.
- `search_design_system`: search tokens, routes, and core source files.
- `get_route`: return metadata for a local design-system route.
- `render_token_card`: render the token-download card HTML for a state and density.

## Example Prompts

- "Show me all `color.v2` tokens for dark mode."
- "Render the condensed token download card."
- "Search the design system for sidebar CTA."
- "Read the CSS variable map resource."
