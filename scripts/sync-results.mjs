#!/usr/bin/env node
/**
 * Makes the result posts in Supabase match `public/assets/results/`.
 *
 *   npm run sync-results            # do it
 *   npm run sync-results -- --dry-run
 *
 * The client replaces this folder wholesale when a new set of success posts
 * arrives. The live site reads gallery rows from the database, so the folder
 * on its own changes nothing until the rows and storage objects follow. This
 * script:
 *
 *   1. uploads every PNG in the folder to the `media` bucket under
 *      `results/<file>-<content hash>.png` (a file already there is skipped);
 *   2. inserts a gallery row for each new upload, flagging the first
 *      CAROUSEL_COUNT for the homepage strip, in file-number order;
 *   3. deletes result rows and storage objects that are no longer in the
 *      folder, and re-numbers the press clippings to sit after the results.
 *
 * Because the storage path carries a content hash, replacing a file under the
 * same name is treated as a new image and the old one is removed, so a stale
 * CDN copy can never be served. Rows that survive keep whatever alt text the
 * admin has written for them.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const FOLDER = path.join("public", "assets", "results");
const BUCKET = "media";
const PREFIX = "results";
const CAROUSEL_COUNT = 24;
const dryRun = process.argv.includes("--dry-run");

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// --- What the folder holds ------------------------------------------------
const files = readdirSync(FOLDER)
  .filter((name) => /^\d+\.png$/i.test(name))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
  .map((name) => {
    const body = readFileSync(path.join(FOLDER, name));
    const hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 10);
    const stem = name.replace(/\.png$/i, "");
    return { name, body, storagePath: `${PREFIX}/${stem}-${hash}.png` };
  });

if (files.length === 0) {
  console.error(`No numbered PNGs found in ${FOLDER}.`);
  process.exit(1);
}
console.log(`Folder: ${files.length} result post(s)${dryRun ? "  (dry run)" : ""}`);

const publicUrlOf = (storagePath) =>
  supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

// --- What the database holds -----------------------------------------------
const { data: rows, error: readError } = await supabase
  .from("gallery_images")
  .select("id, image_url, kind, alt_text, sort_order")
  .order("sort_order");
if (readError) {
  console.error("Could not read gallery_images:", readError.message);
  process.exit(1);
}
const resultRows = rows.filter((r) => r.kind === "result");
const pressRows = rows.filter((r) => r.kind === "press");
const byUrl = new Map(resultRows.map((r) => [r.image_url, r]));

const wanted = new Set(files.map((f) => publicUrlOf(f.storagePath)));
const toInsert = files.filter((f) => !byUrl.has(publicUrlOf(f.storagePath)));
const toDelete = resultRows.filter((r) => !wanted.has(r.image_url));

// Storage objects under results/ that no wanted file points at.
const { data: objects, error: listError } = await supabase.storage
  .from(BUCKET)
  .list(PREFIX, { limit: 1000 });
if (listError) {
  console.error("Could not list storage:", listError.message);
  process.exit(1);
}
const wantedPaths = new Set(files.map((f) => f.storagePath));
const staleObjects = (objects ?? [])
  .map((o) => `${PREFIX}/${o.name}`)
  .filter((p) => !wantedPaths.has(p));

console.log(
  `Database: ${resultRows.length} result row(s) - keep ${resultRows.length - toDelete.length}, ` +
    `remove ${toDelete.length}, add ${toInsert.length}. Storage: ${staleObjects.length} stale object(s).`,
);
if (dryRun) {
  toInsert.forEach((f) => console.log(`  + ${f.name}  ->  ${f.storagePath}`));
  toDelete.forEach((r) => console.log(`  - ${r.image_url}`));
  process.exit(0);
}

// --- Upload the new ones -------------------------------------------------
let uploaded = 0;
let failed = 0;
for (const file of toInsert) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(file.storagePath, file.body, {
      contentType: "image/png",
      cacheControl: "31536000",
      upsert: true,
    });
  if (error) {
    console.error(`\n  upload failed for ${file.name}: ${error.message}`);
    failed += 1;
    continue;
  }
  uploaded += 1;
  process.stdout.write(`\r  uploaded ${uploaded}/${toInsert.length}`);
}
if (toInsert.length > 0) console.log("");

// --- Rows: delete stale, insert new, renumber everything ------------------
if (toDelete.length > 0) {
  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .in("id", toDelete.map((r) => r.id));
  if (error) {
    console.error("  delete failed:", error.message);
    process.exit(1);
  }
}

for (const [index, file] of files.entries()) {
  const n = index + 1;
  const image_url = publicUrlOf(file.storagePath);
  const existing = byUrl.get(image_url);
  const patch = { sort_order: n, show_in_carousel: n <= CAROUSEL_COUNT };
  const { error } = existing
    ? await supabase.from("gallery_images").update(patch).eq("id", existing.id)
    : await supabase.from("gallery_images").insert({
        image_url,
        alt_text: `Acumen Gate Academy student qualified in GATE 2026 — success post ${n}`,
        kind: "result",
        show_in_news_strip: false,
        ...patch,
      });
  if (error) {
    console.error(`  row failed for ${file.name}: ${error.message}`);
    failed += 1;
  }
}

// Press clippings follow the results so the strip opens on students' faces.
for (const [index, row] of pressRows.entries()) {
  const { error } = await supabase
    .from("gallery_images")
    .update({ sort_order: files.length + index + 1 })
    .eq("id", row.id);
  if (error) console.error("  press renumber failed:", error.message);
}

// --- Storage: remove what nothing points at any more ----------------------
if (staleObjects.length > 0) {
  const { error } = await supabase.storage.from(BUCKET).remove(staleObjects);
  if (error) console.error("  storage cleanup failed:", error.message);
  else console.log(`  removed ${staleObjects.length} old object(s) from storage`);
}

console.log(
  `\nDone. ${uploaded} uploaded, ${toDelete.length} row(s) removed, ${failed} failed. ` +
    `Gallery now has ${files.length} result post(s) + ${pressRows.length} press clipping(s).`,
);
console.log("The live site picks this up within 5 minutes (page revalidation).");
process.exit(failed === 0 ? 0 : 1);
