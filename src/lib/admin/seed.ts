"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";
import { requireAdmin } from "./auth";
import { runSeed, type SeedResult } from "./seed-core";

export type { SeedResult };

/**
 * Admin-panel entry point for loading the starting content.
 *
 * Authorises the request, then hands off to runSeed - the same function
 * scripts/seed.mjs calls, so the two paths can never diverge.
 */
export async function seedDatabase(): Promise<SeedResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "Please sign in first.", inserted: [], skipped: [] };
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return {
      ok: false,
      message: "The database isn't connected. Add your Supabase keys and restart.",
      inserted: [],
      skipped: [],
    };
  }

  const result = await runSeed(supabase);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}
