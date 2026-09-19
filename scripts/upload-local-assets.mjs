#!/usr/bin/env node
/**
 * Moves the seeded local images into Supabase Storage.
 *
 *   npm run upload-assets
 *
 * After seeding, gallery rows and the logo point at files under public/assets.
 * Those work, but the client cannot remove or replace them without a code
 * deploy, which is exactly what SRS 9.3 forbids. This uploads each one to the
 * `media` bucket and repoints the database at the uploaded copy.
 *
 * The files under public/assets stay where they are on purpose: they remain the
 * fallback the site renders when the database is unreachable (see
 * src/lib/content.ts), so both paths keep working.
 *
 * Safe to re-run: rows already pointing at Supabase are skipped.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

/** Uploads one file from public/ and returns its public URL. */
async function upload(localUrl, folder) {
  const filePath = path.join("public", localUrl.replace(/^\//, ""));
  if (!existsSync(filePath)) {
    console.warn(`  missing on disk, skipped: ${filePath}`);
    return null;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";
  const storagePath = `${folder}/${crypto.randomUUID()}${extension}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(storagePath, readFileSync(filePath), {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) {
    console.error(`  upload failed for ${filePath}: ${error.message}`);
    return null;
  }

  return supabase.storage.from("media").getPublicUrl(storagePath).data.publicUrl;
}

// --- Gallery images ------------------------------------------------------
const { data: images, error: readError } = await supabase
  .from("gallery_images")
  .select("id, image_url, kind")
  .order("sort_order");

if (readError) {
  console.error("Could not read gallery_images:", readError.message);
  process.exit(1);
}

const pending = images.filter((row) => row.image_url.startsWith("/"));
console.log(`Gallery: ${pending.length} local image(s) to upload, ${images.length - pending.length} already in storage.`);

let done = 0;
let failed = 0;

for (const row of pending) {
  const publicUrl = await upload(row.image_url, row.kind === "press" ? "press" : "results");
  if (!publicUrl) {
    failed += 1;
    continue;
  }
  const { error } = await supabase
    .from("gallery_images")
    .update({ image_url: publicUrl })
    .eq("id", row.id);
  if (error) {
    console.error(`  row update failed: ${error.message}`);
    failed += 1;
    continue;
  }
  done += 1;
  process.stdout.write(`\r  uploaded ${done}/${pending.length}`);
}
if (pending.length > 0) console.log("");

// --- Logo ----------------------------------------------------------------
const { data: settings } = await supabase
  .from("site_settings")
  .select("id, logo_url")
  .limit(1)
  .maybeSingle();

if (settings?.logo_url?.startsWith("/")) {
  const publicUrl = await upload(settings.logo_url, "branding");
  if (publicUrl) {
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_url: publicUrl })
      .eq("id", settings.id);
    if (error) console.error("  logo row update failed:", error.message);
    else console.log("Logo: uploaded and linked.");
  }
} else {
  console.log("Logo: already in storage or not set.");
}

console.log(`\nDone. ${done} image(s) uploaded, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
