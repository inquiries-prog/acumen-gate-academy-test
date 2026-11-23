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
    /**
     * For lists that are split into groups (FAQ categories, the dropdowns in
     * form_options, one SEO row per page): inserts the starting rows of any
     * group that has NO rows yet. That lets a new release add, say, a new FAQ
     * category or a new page's SEO row to a database that was seeded long ago,
     * while a group the client has already edited is never touched.
     */
    async function fillGroups(table: string, rows: Record<string, unknown>[], groupColumn: string) {
      const { data, error } = await supabase.from(table).select(groupColumn);
      if (error) throw new Error(`${table}: ${error.message}`);
      const existing = new Set(
        ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => String(r[groupColumn])),
      );
      const missing = rows.filter((r) => !existing.has(String(r[groupColumn])));
      if (missing.length === 0) {
        skipped.push(table);
        return;
      }
      const { error: insertError } = await supabase.from(table).insert(missing);
      if (insertError) throw new Error(`${table}: ${insertError.message}`);
      inserted.push(table);
    }

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
    await fill("key_dates", strip(D.keyDates));
    await fill("ecosystem_cards", strip(D.ecosystemCards));
    await fill("centers", strip(D.centers));
    await fillGroups("faqs", strip(D.faqs), "category");
    await fillGroups("form_options", strip(D.formOptions), "field_key");
    await fill("universities", strip(D.universities));
    await fill("gallery_images", strip(D.galleryImages));
    await fill("about_blocks", D.aboutBlocks as unknown as Record<string, unknown>[]);
    await fillGroups("page_seo", D.pageSeo as unknown as Record<string, unknown>[], "path");

    // Courses and their syllabus rows are linked, so - as with branches -
    // course ids are captured on insert and the syllabus is attached by slug.
    const { count: courseCount, error: courseCountError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });
    if (courseCountError) throw new Error(`courses: ${courseCountError.message}`);
    if ((courseCount ?? 0) === 0) {
      const { data: newCourses, error } = await supabase
        .from("courses")
        .insert(strip(D.courses))
        .select("id, slug");
      if (error) throw new Error(`courses: ${error.message}`);
      inserted.push("courses");

      const bySlug = new Map((newCourses ?? []).map((c) => [c.slug as string, c.id as string]));
      const subjectRows = D.courseSubjects
        .map(({ id: _id, course_id, ...rest }) => {
          const seedCourse = D.courses.find((c) => c.id === course_id);
          const realId = seedCourse ? bySlug.get(seedCourse.slug) : undefined;
          return realId ? { ...rest, course_id: realId } : null;
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);
      if (subjectRows.length > 0) {
        const { error: subjectError } = await supabase.from("course_subjects").insert(subjectRows);
        if (subjectError) throw new Error(`course_subjects: ${subjectError.message}`);
        inserted.push("course_subjects");
      }
    } else {
      skipped.push("courses");
    }
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

/**
 * Optional: loads the SAMPLE batch details from defaults.ts into a database
 * that was seeded before the course pages existed
 * (`npm run seed -- --sample-batches`).
 *
 * For each branch it fills in the title, schedule, language, start date,
 * duration and badge of the existing batches - only where those are still
 * blank or the starting placeholder, so real details the client has entered
 * are never overwritten - and adds any sample batch the branch doesn't have
 * yet (the weekend batch). Fees, demo videos and visibility are left alone.
 */
export async function runSampleBatches(supabase: SupabaseClient): Promise<SeedResult> {
  const inserted: string[] = [];
  const skipped: string[] = [];
  try {
    const [branchRes, batchRes] = await Promise.all([
      supabase.from("branches").select("id, code"),
      supabase.from("batches").select("*").order("sort_order"),
    ]);
    if (branchRes.error) throw new Error(`branches: ${branchRes.error.message}`);
    if (batchRes.error) throw new Error(`batches: ${batchRes.error.message}`);

    const blank = (v: unknown) => v === null || v === undefined || v === "" || v === D.PLACEHOLDER;
    const fillable = ["title", "schedule", "medium", "start_date", "duration", "badge"] as const;
    let updated = 0;
    let added = 0;

    for (const branch of branchRes.data ?? []) {
      const seedBranch = D.branches.find((b) => b.code === branch.code);
      if (!seedBranch) continue;
      const samples = D.batches.filter((b) => b.branch_id === seedBranch.id);
      const own = (batchRes.data ?? []).filter((b) => b.branch_id === branch.id);

      for (const mode of ["offline", "online"] as const) {
        const modeSamples = samples.filter((s) => s.mode === mode);
        const modeRows = own.filter((b) => b.mode === mode);

        // Fill the existing rows from the samples, in order.
        for (let i = 0; i < Math.min(modeRows.length, modeSamples.length); i++) {
          const patch: Record<string, unknown> = {};
          for (const key of fillable) {
            if (blank(modeRows[i][key]) && !blank(modeSamples[i][key])) {
              patch[key] = modeSamples[i][key];
            }
          }
          if (Object.keys(patch).length > 0) {
            const { error } = await supabase.from("batches").update(patch).eq("id", modeRows[i].id);
            if (error) throw new Error(`batches: ${error.message}`);
            updated++;
          }
        }

        // Add any sample batch this branch doesn't have yet.
        for (const sample of modeSamples.slice(modeRows.length)) {
          const { id: _id, branch_id: _branchId, ...rest } = sample;
          const { error } = await supabase.from("batches").insert({ ...rest, branch_id: branch.id });
          if (error) throw new Error(`batches: ${error.message}`);
          added++;
        }
      }
    }

    (updated + added > 0 ? inserted : skipped).push("batches");
    return { ok: true, message: `Sample batches: ${updated} filled in, ${added} added.`, inserted, skipped };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not load the sample batches.",
      inserted,
      skipped,
    };
  }
}
