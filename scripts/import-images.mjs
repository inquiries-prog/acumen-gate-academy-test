#!/usr/bin/env node
/**
 * Bulk image importer.
 *
 * Uploading ~84 result images and press clippings one at a time through the
 * admin panel would be miserable, so this uploads a whole folder to Supabase
 * Storage and creates the matching gallery rows in one go.
 *
 * Usage:
 *   node scripts/import-images.mjs --dir ./incoming/results --kind result
 *   node scripts/import-images.mjs --dir ./incoming/press   --kind press --news-strip
 *
 * Options:
 *   --dir <path>     Folder of images to import (required).
 *   --kind <k>       "result" (default) or "press".
 *   --news-strip     Also show these in "In the News" on the About page.
 *   --no-carousel    Don't show these in the homepage scrolling strip.
 *   --alt "<text>"   Base description; a number is appended per image.
 *   --dry-run        List what would happen without uploading anything.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const IMAGE_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

function loadEnv() {
  const file = ".env.local";
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

function parseArgs(argv) {
  const args = { kind: "result", carousel: true, newsStrip: false, dryRun: false, alt: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dir") args.dir = argv[++i];
    else if (arg === "--kind") args.kind = argv[++i];
    else if (arg === "--alt") args.alt = argv[++i];
    else if (arg === "--news-strip") args.newsStrip = true;
    else if (arg === "--no-carousel") args.carousel = false;
    else if (arg === "--dry-run") args.dryRun = true;
  }
  return args;
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  if (!args.dir) {
    console.error("Please pass --dir <folder of images>. See the header of this file for usage.");
    process.exit(1);
  }
  if (!["result", "press"].includes(args.kind)) {
    console.error('--kind must be "result" or "press".');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.",
    );
    process.exit(1);
  }

  const entries = (await readdir(args.dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && IMAGE_TYPES[path.extname(e.name).toLowerCase()])
    // Natural sort, so "img2" comes before "img10".
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (entries.length === 0) {
    console.error(`No images found in ${args.dir}.`);
    process.exit(1);
  }

  console.log(`Found ${entries.length} image(s) in ${args.dir}`);
  console.log(
    `  kind=${args.kind}  carousel=${args.carousel}  newsStrip=${args.newsStrip}` +
      (args.dryRun ? "  (dry run)" : ""),
  );

  if (args.dryRun) {
    entries.forEach((e, i) => console.log(`  ${String(i + 1).padStart(3)}. ${e.name}`));
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Continue after the highest existing sort_order, so re-running appends.
  const { data: last } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  let order = (last?.[0]?.sort_order ?? 0) + 1;

  const baseAlt =
    args.alt ||
    (args.kind === "press"
      ? "Newspaper coverage of Acumen Gate Academy students"
      : "Acumen Gate Academy student GATE result");

  let uploaded = 0;
  let failed = 0;

  for (const entry of entries) {
    const filePath = path.join(args.dir, entry.name);
    const extension = path.extname(entry.name).toLowerCase();
    const contentType = IMAGE_TYPES[extension];
    const storagePath = `gallery/${crypto.randomUUID()}${extension}`;

    try {
      const body = await readFile(filePath);
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, body, { contentType, cacheControl: "31536000", upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(storagePath);

      const { error: insertError } = await supabase.from("gallery_images").insert({
        image_url: publicUrl,
        alt_text: `${baseAlt} ${order}`,
        kind: args.kind,
        show_in_carousel: args.carousel,
        show_in_news_strip: args.newsStrip,
        sort_order: order,
      });
      if (insertError) throw new Error(insertError.message);

      uploaded += 1;
      order += 1;
      process.stdout.write(`\r  uploaded ${uploaded}/${entries.length}`);
    } catch (err) {
      failed += 1;
      console.error(`\n  FAILED ${entry.name}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`);
  console.log(
    "Open the admin panel under 'Result & press images' to edit the descriptions, which are used for search engines and screen readers.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
