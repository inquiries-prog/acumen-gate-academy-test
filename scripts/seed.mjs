#!/usr/bin/env node
/**
 * Command-line seeder.
 *
 *   node scripts/seed.mjs
 *
 * Does exactly what the admin panel's "Load starting content" button does -
 * it calls the same runSeed() - but works before an admin login exists, which
 * is the case immediately after the database is first created.
 *
 * Safe to run repeatedly: tables that already contain rows are skipped.
 *
 * Run it via `npm run seed`, which supplies the --experimental-strip-types flag
 * Node needs to import the project's TypeScript directly. That import is the
 * point: the seed data lives only in src/lib/defaults.ts and is never copied.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.",
  );
  process.exit(1);
}

const { runSeed } = await import("../src/lib/admin/seed-core.ts");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const result = await runSeed(supabase);

console.log(result.ok ? `\n${result.message}` : `\nFailed: ${result.message}`);
if (result.inserted.length > 0) console.log("  filled:  " + result.inserted.join(", "));
if (result.skipped.length > 0) console.log("  skipped: " + result.skipped.join(", "));

process.exit(result.ok ? 0 : 1);
