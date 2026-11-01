# ZenMode Design System

The design tokens, foundations and component reference for **ZenMode OS**, the intentional Android launcher. One source of truth for colour, type, spacing and icons, published as a static site and as an MCP server so designers, developers and AI tools all build from the same tokens.

## What's inside

| Path | What it is |
|---|---|
| `tokens.json` | The design tokens: `meta`, `collections` and `foundations` |
| `index.html`, `styles.css`, `src/` | The design system site (a static SPA with custom routes) |
| `mcp/`, `run-zenmode-mcp.sh` | An MCP server that exposes the tokens to AI coding tools |
| `server.mjs` | Local dev server |
| `scripts/` | Static build (`build-static.mjs`) that generates `public/` |
| `tests/` | Node test suite |

## Run it

No runtime dependencies. You only need Node.js.

```bash
npm run dev     # local dev server
npm run build   # generate the static site into public/
npm test        # run the test suite
npm run check   # syntax check plus tests
npm run mcp     # start the MCP server
```

## Deploy

It deploys to Vercel as a static site. Use the **Other** framework preset, build command `npm run build` and output directory `public`. `vercel.json` already sets these. See [VERCEL.md](VERCEL.md) for troubleshooting.

## Related

- [zenmode-os-brand-style](https://github.com/justkamal07/zenmode-os-brand-style): the ZenMode OS brand style guide
- [taste-mcp](https://github.com/justkamal07/taste-mcp): one MCP link that gives coding agents design taste

---

Made by [Kamalraaj Senthilkumar](https://www.justkamalthings.com/).
