"use server";

import { revalidatePath } from "next/cache";
import { getCollection, type CollectionDef, type FieldDef } from "./collections";
import { requireAdmin } from "./auth";
import { getServiceClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

/**
 * Server Actions behind the admin panel.
 *
 * Two rules hold throughout:
 *   - every action calls requireAdmin() first, because a Server Action is a
 *     public HTTP endpoint and the middleware only guards page navigation;
 *   - every successful write revalidates the site, so an edit is live
 *     immediately and the client never wonders whether it "took" (SRS 9.1).
 */

export interface ActionResult {
  ok: boolean;
  message: string;
}

function client() {
  const supabase = getServiceClient();
  if (!supabase) {
    throw new Error(
      "The database isn't connected yet. Add your Supabase keys to .env.local and restart.",
    );
  }
  return supabase;
}

/** Content changes can affect any page, so the whole site is refreshed. */
function refreshSite() {
  revalidatePath("/", "layout");
}

/** Turns a form value into the type its database column expects. */
function coerce(field: FieldDef, form: FormData): unknown {
  const raw = form.get(field.name);

  switch (field.type) {
    case "boolean":
      // An unchecked checkbox submits nothing at all.
      return raw === "on" || raw === "true";
    case "number": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
    case "money": {
      if (raw === null || String(raw).trim() === "") return null;
      const n = Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }
    default:
      return typeof raw === "string" ? raw.trim() : "";
  }
}

function buildRow(def: CollectionDef, form: FormData): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of def.fields) {
    row[field.name] = coerce(field, form);
  }

  // A blank web address is filled in from the title, so the client never has
  // to think about URLs.
  if (def.table === "news_posts") {
    const slug = String(row.slug ?? "").trim();
    if (!slug) row.slug = slugify(String(row.title ?? "")) || `post-${Date.now()}`;
  }

  return row;
}

function validate(def: CollectionDef, row: Record<string, unknown>): string | null {
  for (const field of def.fields) {
    if (!field.required) continue;
    const value = row[field.name];
    if (value === null || value === undefined || String(value).trim() === "") {
      return `Please fill in "${field.label}".`;
    }
  }
  return null;
}

export async function saveCollectionRow(
  slug: string,
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const def = getCollection(slug);
    if (!def) return { ok: false, message: "Unknown section." };

    const row = buildRow(def, formData);
    const problem = validate(def, row);
    if (problem) return { ok: false, message: problem };

    const supabase = client();
    const pk = def.pk ?? "id";

    if (id) {
      const { error } = await supabase.from(def.table).update(row).eq(pk, id);
      if (error) throw new Error(error.message);
    } else {
      if (def.allowCreate === false) {
        return { ok: false, message: `You can't add a new ${def.singular} here.` };
      }
      const { error } = await supabase.from(def.table).insert(row);
      if (error) throw new Error(error.message);
    }

    refreshSite();
    return { ok: true, message: "Saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}

export async function deleteCollectionRow(slug: string, id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const def = getCollection(slug);
    if (!def) return { ok: false, message: "Unknown section." };
    if (def.allowDelete === false) {
      return { ok: false, message: `${def.title} can't be deleted, only hidden.` };
    }

    const { error } = await client()
      .from(def.table)
      .delete()
      .eq(def.pk ?? "id", id);
    if (error) throw new Error(error.message);

    refreshSite();
    return { ok: true, message: "Deleted." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not delete." };
  }
}

/** Site-wide settings: banner, hero, contact details, footer (SRS 9.2). */
export async function saveSiteSettings(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const booleanFields = ["banner_enabled"];
    const row: Record<string, unknown> = { id: true, updated_at: new Date().toISOString() };

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("$")) continue; // Next.js internal fields
      if (value instanceof File) continue;
      row[key] = typeof value === "string" ? value.trim() : value;
    }
    for (const key of booleanFields) {
      row[key] = formData.get(key) === "on";
    }

    const { error } = await client().from("site_settings").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);

    refreshSite();
    return { ok: true, message: "Saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}

/** About Us page copy - one row per text block (SRS 9.2). */
export async function saveAboutBlock(key: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const row = {
      key,
      heading: String(formData.get("heading") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
    };
    const { error } = await client().from("about_blocks").upsert(row, { onConflict: "key" });
    if (error) throw new Error(error.message);

    refreshSite();
    return { ok: true, message: "Saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}

/** Batch details, including the per-branch demo video (SRS 9.2). */
export async function saveBatch(batchId: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const feesRaw = String(formData.get("fees") ?? "").trim();
    const fees = feesRaw === "" ? null : Number(feesRaw);
    if (fees !== null && (!Number.isFinite(fees) || fees < 0)) {
      return { ok: false, message: "Please enter a valid fee amount, or leave it blank." };
    }

    const videoStartRaw = String(formData.get("video_start") ?? "0").trim();
    const videoStart = Number(videoStartRaw);

    const row = {
      start_date: String(formData.get("start_date") ?? "").trim(),
      duration: String(formData.get("duration") ?? "").trim(),
      faculty: String(formData.get("faculty") ?? "").trim(),
      fees,
      seats: String(formData.get("seats") ?? "").trim(),
      video_id: extractVideoId(String(formData.get("video_id") ?? "")),
      video_start: Number.isFinite(videoStart) && videoStart >= 0 ? Math.floor(videoStart) : 0,
      enroll_enabled: formData.get("enroll_enabled") === "on",
      visible: formData.get("visible") === "on",
    };

    const { error } = await client().from("batches").update(row).eq("id", batchId);
    if (error) throw new Error(error.message);

    refreshSite();
    return { ok: true, message: "Saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}

/**
 * Accepts a full YouTube URL or a bare ID, so the client can paste whatever
 * they copied from the address bar.
 */
function extractVideoId(input: string): string {
  const value = input.trim();
  if (!value) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return "";
}

// --- Results page: years and entries (SRS 7.4, 9.2) -----------------------

export async function saveResultYear(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const label = String(formData.get("label") ?? "").trim();
    const year = Number(formData.get("year"));
    if (!label) return { ok: false, message: 'Please enter a name for the year, e.g. "GATE 2027".' };
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return { ok: false, message: "Please enter a valid four-digit year." };
    }

    const row = {
      label,
      year,
      visible: formData.get("visible") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    };

    const supabase = client();
    const { error } = id
      ? await supabase.from("result_years").update(row).eq("id", id)
      : await supabase.from("result_years").insert(row);
    if (error) throw new Error(error.message);

    refreshSite();
    return { ok: true, message: "Saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}

export async function deleteResultYear(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    // Result entries cascade with the year, by design.
    const { error } = await client().from("result_years").delete().eq("id", id);
    if (error) throw new Error(error.message);
    refreshSite();
    return { ok: true, message: "Year deleted." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not delete." };
  }
}

export async function saveResultEntry(
  yearId: string,
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const student_name = String(formData.get("student_name") ?? "").trim();
    if (!student_name) return { ok: false, message: "Please enter the student's name." };

    const row = {
      year_id: yearId,
      student_name,
      image_url: String(formData.get("image_url") ?? "").trim(),
      alt_text: String(formData.get("alt_text") ?? "").trim(),
      university: String(formData.get("university") ?? "").trim(),
      branch: String(formData.get("branch") ?? "").trim(),
      air: String(formData.get("air") ?? "").trim(),
      visible: formData.get("visible") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    };

    const supabase = client();
    const { error } = id
      ? await supabase.from("result_entries").update(row).eq("id", id)
      : await supabase.from("result_entries").insert(row);
    if (error) throw new Error(error.message);

    refreshSite();
    return { ok: true, message: "Saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}

export async function deleteResultEntry(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { error } = await client().from("result_entries").delete().eq("id", id);
    if (error) throw new Error(error.message);
    refreshSite();
    return { ok: true, message: "Deleted." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not delete." };
  }
}

// --- Leads (SRS 10) -------------------------------------------------------

/** Marks a lead contacted, so follow-up can be tracked (SRS 10). */
export async function setLeadContacted(
  table: "general_enquiries" | "seminar_leads" | "enrollments",
  id: string,
  contacted: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { error } = await client().from(table).update({ contacted }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin", "layout");
    return { ok: true, message: contacted ? "Marked as contacted." : "Marked as not contacted." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not update." };
  }
}

export async function saveLeadNotes(
  table: "general_enquiries" | "seminar_leads",
  id: string,
  notes: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { error } = await client()
      .from(table)
      .update({ notes: notes.slice(0, 2000) })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Note saved." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not save." };
  }
}
