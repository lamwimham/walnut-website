import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const assetVersion = (
  process.env.NEXT_PUBLIC_BUILD_VERSION ??
  process.env.BUILD_VERSION ??
  new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)
).replace(/[^a-zA-Z0-9._-]/g, "");

const chunkReferencePattern =
  /(\/_next\/static\/chunks\/[^"'\\\s<>?]+?\.(?:js|css))(?:\?v=[a-zA-Z0-9._-]+)?/g;

async function collectRenderableFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRenderableFiles(fullPath)));
      continue;
    }

    if (entry.name.endsWith(".html") || entry.name.endsWith(".txt")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = await collectRenderableFiles(distDir);
let changedFiles = 0;

for (const file of files) {
  const original = await readFile(file, "utf8");
  const updated = original.replace(
    chunkReferencePattern,
    `$1?v=${assetVersion}`
  );

  if (updated !== original) {
    await writeFile(file, updated);
    changedFiles += 1;
  }
}

console.log(
  `Cache-busted ${changedFiles} static export files with asset version ${assetVersion}`
);
