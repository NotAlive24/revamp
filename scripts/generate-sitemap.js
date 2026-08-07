// scripts/generate-sitemap.js
//
// Walks src/writeups/**/*.md and generates public/sitemap.xml with an
// entry for the homepage plus every individual writeup URL.
//
// The slug logic here is copy-matched to src/data/writeups.js's
// createSlug() — if you ever change slug generation there, mirror the
// change here too, or the sitemap will list URLs that don't match your
// actual routes.
//
// Wired into package.json as: "build": "node scripts/generate-sitemap.js && vite build"
// so it regenerates on every build instead of going stale.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const WRITEUPS_DIR = join(__dirname, "..", "src", "writeups");
const OUTPUT_PATH = join(__dirname, "..", "public", "sitemap.xml");
const SITE_URL = "https://notalive.in";

function createSlug(relativePath) {
  return relativePath
    .replace(/\.md$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function main() {
  const files = walk(WRITEUPS_DIR);

  const writeupEntries = files.map((fullPath) => {
    const rel = relative(WRITEUPS_DIR, fullPath).split("\\").join("/");
    const slug = createSlug(rel);
    const mtime = statSync(fullPath).mtime;
    return { slug, lastmod: formatDate(mtime) };
  });

  const today = formatDate(new Date());

  const urlEntries = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...writeupEntries.map(
      ({ slug, lastmod }) =>
        `  <url>\n    <loc>${SITE_URL}/writeups/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join(
    "\n"
  )}\n</urlset>\n`;

  writeFileSync(OUTPUT_PATH, xml, "utf-8");
  console.log(`Wrote ${writeupEntries.length + 1} URLs to ${OUTPUT_PATH}`);
}

main();