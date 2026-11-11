import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "content/site.json");
const site = JSON.parse(await readFile(contentPath, "utf8"));

function resolveAssetPath(value, context) {
  const assetPath = typeof value === "string" && value.startsWith("/") ? value.slice(1) : value;
  const segments = typeof assetPath === "string" ? assetPath.split("/") : [];
  if (
    typeof assetPath !== "string" ||
    value.startsWith("//") ||
    assetPath.includes("\\") ||
    !assetPath.startsWith("assets/") ||
    segments.some(segment => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`${context} has an unsafe asset path: ${JSON.stringify(value)}.`);
  }
  return path.resolve(root, assetPath);
}

if (!Array.isArray(site.works) || site.works.length === 0) {
  throw new Error("content/site.json must include at least one artwork.");
}

const ids = new Set();
let publishedCount = 0;
let featuredCount = 0;

for (const work of site.works) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.id || "")) {
    throw new Error(`Invalid artwork ID: ${work.id || "(empty)"}`);
  }
  if (ids.has(work.id)) throw new Error(`Duplicate artwork ID: ${work.id}`);
  ids.add(work.id);

  if (typeof work.published !== "boolean") {
    throw new Error(`Artwork ${work.id} must have a published status.`);
  }
  if (work.published) publishedCount += 1;
  if (work.published && work.featured === true) featuredCount += 1;
  if (!["featured", "carousel", "lunar", "logos", "single"].includes(work.layout)) {
    throw new Error(`Unsupported presentation layout for ${work.id}.`);
  }
  if (!["enquire", "available", "sold", "not-for-sale"].includes(work.availability)) {
    throw new Error(`Invalid availability for ${work.id}.`);
  }

  for (const language of ["es", "en"]) {
    if (!work.title?.[language]?.trim()) {
      throw new Error(`Artwork ${work.id} needs a ${language} title.`);
    }
    if (work.medium && typeof work.medium[language] !== "string") {
      throw new Error(`Artwork ${work.id} has an invalid ${language} medium field.`);
    }
    if (work.introduction && typeof work.introduction[language] !== "string") {
      throw new Error(`Artwork ${work.id} has an invalid ${language} introduction field.`);
    }
    if (work.paragraphs && !Array.isArray(work.paragraphs[language])) {
      throw new Error(`Artwork ${work.id} has an invalid ${language} paragraphs list.`);
    }
  }

  if (!Array.isArray(work.images)) throw new Error(`Artwork ${work.id} needs an images list.`);
  for (const image of work.images) {
    const filePath = resolveAssetPath(image.src, `Artwork ${work.id} image`);
    console.log(`Checking artwork ${work.id} image path ${JSON.stringify(image.src)} -> ${filePath}`);
    try {
      await access(filePath);
    } catch (error) {
      throw new Error(`Artwork ${work.id} image ${JSON.stringify(image.src)} cannot be accessed at ${filePath}.`, { cause: error });
    }
    for (const language of ["es", "en"]) {
      if (!image.alt?.[language]?.trim()) {
        throw new Error(`Image ${image.src} needs ${language} alternative text.`);
      }
    }
  }

  if (work.video) {
    const filePath = resolveAssetPath(work.video, `Artwork ${work.id} video`);
    console.log(`Checking artwork ${work.id} video path ${JSON.stringify(work.video)} -> ${filePath}`);
    try {
      await access(filePath);
    } catch (error) {
      throw new Error(`Artwork ${work.id} video ${JSON.stringify(work.video)} cannot be accessed at ${filePath}.`, { cause: error });
    }
  }
  if (work.layout === "featured" && work.images.length === 0) {
    throw new Error(`Featured layout ${work.id} requires a cover image.`);
  }
}

if (publishedCount === 0) throw new Error("At least one artwork must be published.");
if (featuredCount > 1) throw new Error("Only one published artwork may be featured.");

console.log(`Validated ${site.works.length} artworks (${publishedCount} published).`);
