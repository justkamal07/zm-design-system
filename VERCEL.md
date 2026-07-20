# Deploying ZenMode Design System on Vercel

This project is a static SPA with custom routes, so Vercel should deploy the generated `public` folder.

## Vercel Project Settings

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `public`
- Install Command: leave default or empty

The repository includes `vercel.json`, so Vercel should pick these values automatically on a fresh import.

If Vercel still shows `FUNCTION_INVOCATION_FAILED`, the project is still using a function/runtime setting from an older deployment. Clear the build cache and confirm the dashboard settings above. A successful deployment should serve `public/index.html`, not invoke `server.mjs`.

## Local Build Check

```sh
node scripts/build-static.mjs
```

The build output should include:

```text
public/index.html
public/styles.css
public/tokens.json
public/src/app.js
public/src/icons.js
public/mcp/README.md
dist/index.html
dist/styles.css
dist/tokens.json
dist/src/app.js
dist/src/icons.js
dist/mcp/README.md
```

## Deep Links

Routes such as `/foundations/typography`, `/foundations/color`, `/foundations/icons`, `/components`, and `/tokens` are client-side SPA routes. `vercel.json` rewrites them to `/index.html` so direct refreshes work after deployment.

## MCP Note

The website can be deployed to Vercel. The MCP server itself is a local stdio server and should still be launched locally with:

```sh
node mcp/zenmode-mcp.mjs
```
