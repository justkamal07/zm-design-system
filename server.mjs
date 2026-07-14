import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return join(root, normalized === "/" ? "index.html" : normalized);
}

async function serveFile(pathname) {
  let filePath = safePath(pathname);
  let ext = extname(filePath);

  try {
    if (!ext) {
      filePath = join(filePath, "index.html");
      ext = ".html";
    }
    const body = await readFile(filePath);
    return { status: 200, body, type: mimeTypes[ext] || "application/octet-stream" };
  } catch {
    const body = await readFile(join(root, "index.html"));
    return { status: 200, body, type: mimeTypes[".html"] };
  }
}

createServer(async (req, res) => {
  const result = await serveFile(req.url || "/");
  res.writeHead(result.status, { "content-type": result.type });
  res.end(result.body);
}).listen(port, "127.0.0.1", () => {
  console.log(`ZenMode Design System running at http://localhost:${port}`);
});
