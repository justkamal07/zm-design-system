import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");

const files = [
  "index.html",
  "styles.css",
  "tokens.json"
];

const directories = [
  "assets",
  "src"
];

async function buildInto(target) {
  await rm(target, { force: true, recursive: true });
  await mkdir(target, { recursive: true });

  for (const file of files) {
    await cp(path.join(root, file), path.join(target, file));
  }

  for (const directory of directories) {
    await cp(path.join(root, directory), path.join(target, directory), { recursive: true });
  }

  await mkdir(path.join(target, "mcp"), { recursive: true });
  await cp(path.join(root, "mcp", "README.md"), path.join(target, "mcp", "README.md"));
}

await buildInto(dist);
await buildInto(publicDir);
