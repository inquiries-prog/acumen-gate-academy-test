import type { SupabaseClient } from "@supabase/supabase-js";
import * as D from "../defaults.ts";

/**
 * Loads the starting content into an empty database.
 *
 * Seeding from defaults.ts rather than a hand-written seed.sql means there is
 * exactly one copy of the SRS copy in this project. The fallback content the
 * site renders before Supabase is connected and the rows written here can never
 * drift apart, because they are the same source.
 *
 * Safe to run more than once: every table is skipped if it already has rows, so
 * this can never overwrite the client's own edits.
 *
 * Deliberately free of "use server", Next imports and auth checks, so it can be
 * driven either by the admin panel's server action (src/lib/admin/seed.ts) or
 * from the command line (scripts/seed.mjs) without the logic existing twice.
 * The caller is responsible for authorising the request.
 */

export interface SeedResult {
  ok: boolean;
  message: string;
  inserted: string[];
  skipped: string[];
}

export async function runSeed(supabase: SupabaseClient): Promise<SeedResult> {
  const inserted: string[] = [];
  const skipped: string[] = [];

  try {
    /** Inserts rows only when the table is empty. */
    async function fill(table: string, rows: Record<string, unknown>[]) {
      if (rows.length === 0) return;
      const { count, error: countError } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (countError) throw new Error(`${table}: ${countError.message}`);
      if ((count ?? 0) > 0) {
        skipped.push(table);
        return;
      }
      const { error } = await supabase.from(table).insert(rows);
      if (error) throw new Error(`${table}: ${error.message}`);
      inserted.push(table);
    }

    // Site settings is a single row keyed on a fixed primary key.
    const { count: settingsCount } = await supabase
      .from("site_settings")
      .select("*", { count: "exact", head: true });
    if ((settingsCount ?? 0) === 0) {
      const { error } = await supabase
        .from("site_settings")
        .insert({ id: true, ...D.siteSettings });
      if (error) throw new Error(`site_settings: ${error.message}`);
      inserted.push("site_settings");
    } else {
      skipped.push("site_settings");
    }

    // Branches and batches are linked, so branch ids are captured on insert and
    // reused rather than trusting the placeholder ids in defaults.ts.
    const { count: branchCount } = await supabase
      .from("branches")
      .select("*", { count: "exact", head: true });

    if ((branchCount ?? 0) === 0) {
      const { data: newBranches, error } = await supabase
        .from("branches")
        .insert(D.branches.map(({ id: _id, ...rest }) => rest))
        .select("id, code");
      if (error) throw new Error(`branches: ${error.message}`);
      inserted.push("branches");

      const byCode = new Map((newBranches ?? []).map((b) => [b.code as string, b.id as string]));
      const batchRows = D.batches
        .map((batch) => {
          const seedBranch = D.branches.find((b) => b.id === batch.branch_id);
          const realId = seedBranch ? byCode.get(seedBranch.code) : undefined;
          if (!realId) return null;
          const { id: _id, branch_id: _branchId, ...rest } = batch;
          return { ...rest, branch_id: realId };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (batchRows.length > 0) {
        const { error: batchError } = await supabase.from("batches").insert(batchRows);
        if (batchError) throw new Error(`batches: ${batchError.message}`);
        inserted.push("batches");
      }
    } else {
      skipped.push("branches");
    }

    // Independent tables. The seed ids are dropped so the database generates
    // real uuids; only about_blocks, page_seo and legal_pages keep their keys.
    await fill("pedagogy_points", strip(D.pedagogyPoints));
    await fill("why_choose_cards", strip(D.whyChooseCards));
    await fill("course_cards", strip(D.courseCards));
    await fill("mentors", strip(D.mentors));
    await fill("testimonials", strip(D.testimonials));
    await fill("result_years", strip(D.resultYears));
    await fill("news_posts", strip(D.newsPosts));
    await fill("ecosystem_cards", strip(D.ecosystemCards));
    await fill("centers", strip(D.centers));
    await fill("faqs", strip(D.faqs));
    await fill("form_options", strip(D.formOptions));
    await fill("universities", strip(D.universities));
    await fill("gallery_images", strip(D.galleryImages));
    await fill("about_blocks", D.aboutBlocks as unknown as Record<string, unknown>[]);
    await fill("page_seo", D.pageSeo as unknown as Record<string, unknown>[]);
    await fill("legal_pages", D.legalPages as unknown as Record<string, unknown>[]);

    return {
      ok: true,
      message:
        inserted.length > 0
          ? `Loaded starting content into ${inserted.length} section${inserted.length === 1 ? "" : "s"}.`
          : "Everything already has content — nothing was changed.",
      inserted,
      skipped,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not load the starting content.",
      inserted,
      skipped,
    };
  }
}

/** Drops the seed-only `id` so Postgres generates a real uuid. */
function strip<T extends { id: string }>(rows: T[]): Record<string, unknown>[] {
  return rows.map(({ id: _id, ...rest }) => rest as Record<string, unknown>);
}
