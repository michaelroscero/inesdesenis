import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "content/site.json");
const site = JSON.parse(await readFile(contentPath, "utf8"));

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
    if (!work.medium || typeof work.medium[language] !== "string") {
      throw new Error(`Artwork ${work.id} needs a ${language} medium field.`);
    }
    if (!work.introduction || typeof work.introduction[language] !== "string") {
      throw new Error(`Artwork ${work.id} needs a ${language} introduction field.`);
    }
    if (!Array.isArray(work.paragraphs?.[language])) {
      throw new Error(`Artwork ${work.id} needs a ${language} paragraphs list.`);
    }
  }

  if (!Array.isArray(work.images)) throw new Error(`Artwork ${work.id} needs an images list.`);
  for (const image of work.images) {
    if (!image.src?.startsWith("assets/") || image.src.includes("..")) {
      throw new Error(`Artwork ${work.id} has an unsafe image path.`);
    }
    await access(path.resolve(root, image.src));
    for (const language of ["es", "en"]) {
      if (!image.alt?.[language]?.trim()) {
        throw new Error(`Image ${image.src} needs ${language} alternative text.`);
      }
    }
  }

  if (work.video) {
    if (!work.video.startsWith("assets/") || work.video.includes("..")) {
      throw new Error(`Artwork ${work.id} has an unsafe video path.`);
    }
    await access(path.resolve(root, work.video));
  }
  if (work.layout === "featured" && work.images.length === 0) {
    throw new Error(`Featured layout ${work.id} requires a cover image.`);
  }
}

if (publishedCount === 0) throw new Error("At least one artwork must be published.");
if (featuredCount > 1) throw new Error("Only one published artwork may be featured.");

console.log(`Validated ${site.works.length} artworks (${publishedCount} published).`);
