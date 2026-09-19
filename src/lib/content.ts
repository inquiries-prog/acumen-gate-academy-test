/**
 * The single read path for all public site content.
 *
 * Every getter tries Supabase and falls back to the seed values in defaults.ts
 * when the database is unconfigured, empty, or unreachable. That keeps the site
 * renderable during development and stops a transient database problem from
 * blanking a section in production.
 */

import { cache } from "react";
import * as D from "./defaults";
import { getPublicClient, getServiceClient } from "./supabase";
import type {
  AboutBlock,
  Batch,
  Branch,
  BranchBatch,
  Center,
  CourseCard,
  EcosystemCard,
  Faq,
  FormOption,
  GalleryImage,
  LegalPage,
  Mentor,
  NewsPost,
  PageSeo,
  PedagogyPoint,
  ResultEntry,
  ResultYear,
  SiteSettings,
  Testimonial,
  University,
  WhyChooseCard,
} from "./types";

type Order = { column: string; ascending?: boolean };

/**
 * Reads a table, falling back to seed data. Uses the service client when
 * available so admin screens see rows that public RLS policies would hide
 * (e.g. hidden years); otherwise the anon client, which is select-only.
 */
async function readTable<T>(
  table: string,
  fallback: T[],
  order: Order | Order[] = { column: "sort_order" },
  filter?: (q: ReturnType<NonNullable<ReturnType<typeof getPublicClient>>["from"]>) => unknown,
): Promise<T[]> {
  const client = getServiceClient() ?? getPublicClient();
  if (!client) return fallback;
  try {
    let query = client.from(table).select("*");
    if (filter) query = filter(query as never) as typeof query;
    for (const o of Array.isArray(order) ? order : [order]) {
      query = query.order(o.column, { ascending: o.ascending ?? true });
    }
    const { data, error } = await query;
    if (error) {
      console.error(`[content] ${table}:`, error.message);
      return fallback;
    }
    // An empty table means "not seeded yet" - show seed content, not a blank page.
    if (!data || data.length === 0) return fallback;
    return data as T[];
  } catch (err) {
    console.error(`[content] ${table} threw:`, err);
    return fallback;
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const client = getServiceClient() ?? getPublicClient();
  if (!client) return D.siteSettings;
  try {
    const { data, error } = await client.from("site_settings").select("*").limit(1).maybeSingle();
    if (error || !data) return D.siteSettings;
    // Merge so a column added later but never saved still has a sane value.
    return { ...D.siteSettings, ...(data as Partial<SiteSettings>) };
  } catch {
    return D.siteSettings;
  }
});

export const getGalleryImages = cache(
  async (): Promise<GalleryImage[]> => readTable<GalleryImage>("gallery_images", D.galleryImages),
);

export const getCarouselImages = cache(async (): Promise<GalleryImage[]> =>
  (await getGalleryImages()).filter((i) => i.show_in_carousel),
);

export const getPressStripImages = cache(async (): Promise<GalleryImage[]> =>
  (await getGalleryImages()).filter((i) => i.show_in_news_strip),
);

export const getCourseCards = cache(async (): Promise<CourseCard[]> =>
  (await readTable<CourseCard>("course_cards", D.courseCards)).filter((c) => c.visible),
);

export const getBranches = cache(async (): Promise<Branch[]> =>
  (await readTable<Branch>("branches", D.branches)).filter((b) => b.visible),
);

export const getBatches = cache(
  async (): Promise<Batch[]> => readTable<Batch>("batches", D.batches),
);

/** Branch rows for one mode - exactly what the batches modal (SRS 7.1.6) needs. */
export async function getBranchBatches(mode: "offline" | "online"): Promise<BranchBatch[]> {
  const [branches, batches] = await Promise.all([getBranches(), getBatches()]);
  return branches.map((branch) => ({
    branch,
    batch: batches.find((b) => b.branch_id === branch.id && b.mode === mode && b.visible) ?? null,
  }));
}

export const getPedagogyPoints = cache(
  async (): Promise<PedagogyPoint[]> => readTable<PedagogyPoint>("pedagogy_points", D.pedagogyPoints),
);

export const getWhyChooseCards = cache(
  async (): Promise<WhyChooseCard[]> => readTable<WhyChooseCard>("why_choose_cards", D.whyChooseCards),
);

export const getTestimonials = cache(async (scope: "home" | "results"): Promise<Testimonial[]> => {
  const all = await readTable<Testimonial>("testimonials", D.testimonials);
  const scoped = all.filter((t) => t.scope === scope && t.visible);
  // The results page reuses the homepage set until its own library is built up.
  if (scoped.length === 0 && scope === "results") {
    return all.filter((t) => t.scope === "home" && t.visible);
  }
  return scoped;
});

export const getMentors = cache(async (): Promise<Mentor[]> =>
  (await readTable<Mentor>("mentors", D.mentors)).filter((m) => m.visible),
);

/** Includes hidden years - the admin screen needs them. Public pages filter. */
export const getAllResultYears = cache(
  async (): Promise<ResultYear[]> => readTable<ResultYear>("result_years", D.resultYears),
);

export const getVisibleResultYears = cache(async (): Promise<ResultYear[]> =>
  (await getAllResultYears()).filter((y) => y.visible),
);

export const getResultEntries = cache(async (): Promise<ResultEntry[]> => {
  const rows = await readTable<ResultEntry>("result_entries", D.resultEntries, [
    { column: "sort_order" },
  ]);
  return rows.filter((e) => e.visible);
});

export const getNewsPosts = cache(async (): Promise<NewsPost[]> =>
  (
    await readTable<NewsPost>("news_posts", D.newsPosts, { column: "published_at", ascending: false })
  ).filter((p) => p.published),
);

export async function getNewsPost(slug: string): Promise<NewsPost | null> {
  return (await getNewsPosts()).find((p) => p.slug === slug) ?? null;
}

export const getAboutBlocks = cache(async (): Promise<Record<string, AboutBlock>> => {
  const rows = await readTable<AboutBlock>("about_blocks", D.aboutBlocks, { column: "key" });
  return Object.fromEntries(rows.map((r) => [r.key, r]));
});

export const getEcosystemCards = cache(
  async (): Promise<EcosystemCard[]> => readTable<EcosystemCard>("ecosystem_cards", D.ecosystemCards),
);

export const getCenters = cache(
  async (): Promise<Center[]> => readTable<Center>("centers", D.centers),
);

export const getFaqs = cache(async (): Promise<Faq[]> =>
  (await readTable<Faq>("faqs", D.faqs)).filter((f) => f.visible),
);

export const getFormOptions = cache(async (): Promise<Record<string, string[]>> => {
  const rows = await readTable<FormOption>("form_options", D.formOptions, [
    { column: "field_key" },
    { column: "sort_order" },
  ]);
  const grouped: Record<string, string[]> = {};
  for (const row of rows) {
    if (!row.visible) continue;
    (grouped[row.field_key] ??= []).push(row.label);
  }
  return grouped;
});

export const getUniversities = cache(async (): Promise<University[]> =>
  (await readTable<University>("universities", D.universities)).filter((u) => u.visible),
);

export const getPageSeo = cache(async (path: string): Promise<PageSeo | null> => {
  const rows = await readTable<PageSeo>("page_seo", D.pageSeo, { column: "path" });
  return rows.find((r) => r.path === path) ?? null;
});

export const getLegalPage = cache(async (slug: string): Promise<LegalPage | null> => {
  const rows = await readTable<LegalPage>("legal_pages", D.legalPages, { column: "slug" });
  return rows.find((r) => r.slug === slug) ?? null;
});
