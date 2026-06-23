const markdownFiles = import.meta.glob("../writeups/**/*.md", {
  query: "?raw",
  import: "default",
});

function cleanTitle(fileName) {
  return fileName
    .replace(".md", "")
    .replace(/^\d+\.\s*/, "");
}

function createSlug(path) {
  return path
    .replace("../writeups/", "")
    .replace(".md", "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const writeups = Object.entries(markdownFiles)
  .map(([path, loader]) => {
    const relativePath = path.replace("../writeups/", "");
    const parts = relativePath.split("/");

    const fileName = parts.at(-1);
    const collection = parts[0];
    const section = parts.slice(1, -1).join(" / ") || "General";

    return {
      path,
      loader,
      title: cleanTitle(fileName),
      collection,
      section,
      slug: createSlug(path),
    };
  })
  .sort((a, b) =>
    a.path.localeCompare(b.path, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );