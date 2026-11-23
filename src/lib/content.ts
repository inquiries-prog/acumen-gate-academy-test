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
  Center,
  Course,
  CourseCard,
  CourseNavItem,
  CourseSubject,
  EcosystemCard,
  Faq,
  FormOption,
  GalleryImage,
  KeyDate,
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

/** Tables already reported as missing, so each is warned about once per process. */
const warnedMissing = new Set<string>();

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
      // A table a newer migration adds, on a database that hasn't run it yet
      // (PostgREST code PGRST205). Expected during an upgrade and handled by
      // the fallback, so it is a one-time warning, not an error - an error
      // here would raise the Next.js dev overlay on every page.
      if (error.code === "PGRST205") {
        if (!warnedMissing.has(table)) {
          warnedMissing.add(table);
          console.warn(
            `[content] table "${table}" doesn't exist yet - using starting content. Run the latest migration in supabase/migrations (see docs/SETUP.md 2.2).`,
          );
        }
        return fallback;
      }
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

/**
 * Every batch, newest columns defaulted. A database that has not yet run
 * migration 0004 returns rows without title/schedule/medium/badge; filling
 * them here means no component has to guard against undefined.
 */
export const getBatches = cache(async (): Promise<Batch[]> =>
  (await readTable<Batch>("batches", D.batches)).map((b) => ({
    ...b,
    title: b.title ?? "",
    schedule: b.schedule ?? "",
    medium: b.medium ?? "",
    badge: b.badge ?? "",
  })),
);

/** Visible batches of one branch, offline first, in display order. */
export async function getBatchesForBranchCode(code: string): Promise<Batch[]> {
  if (!code) return [];
  const [branches, batches] = await Promise.all([getBranches(), getBatches()]);
  const branch = branches.find((b) => b.code === code);
  if (!branch) return [];
  return batches
    .filter((b) => b.branch_id === branch.id && b.visible)
    .sort((a, b) =>
      a.mode === b.mode ? a.sort_order - b.sort_order : a.mode === "offline" ? -1 : 1,
    );
}

/**
 * Visible courses. A database that has not yet run migration 0005 has no
 * syllabus_pdf_url column; those rows fall back to the starting link for the
 * same course, so the "Download official syllabus" button works either way.
 */
export const getCourses = cache(async (): Promise<Course[]> =>
  (await readTable<Course>("courses", D.courses))
    .filter((c) => c.visible)
    .map((c) => ({
      ...c,
      syllabus_pdf_url: c.syllabus_pdf_url ?? D.courses.find((d) => d.slug === c.slug)?.syllabus_pdf_url ?? "",
    })),
);

export async function getCourse(slug: string): Promise<Course | null> {
  return (await getCourses()).find((c) => c.slug === slug) ?? null;
}

/** Just what the header menu needs, for every page. */
export const getCourseNav = cache(async (): Promise<CourseNavItem[]> =>
  (await getCourses()).map(({ slug, title, short_title, category, branch_code }) => ({
    slug,
    title,
    short_title,
    category,
    branch_code,
  })),
);

export const getCourseSubjects = cache(async (courseId: string): Promise<CourseSubject[]> => {
  const all = await readTable<CourseSubject>("course_subjects", D.courseSubjects);
  return all.filter((s) => s.course_id === courseId && s.visible !== false);
});

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
  // The starting entries refer to the starting year ids ("year-2026"). A
  // seeded database has its own ids for the same years, so when we are
  // showing the starting entries, point them at the live year with the same
  // label ("GATE 2026").
  if (rows === D.resultEntries) {
    const years = await getAllResultYears();
    const idFor = new Map(
      D.resultYears.map((dy) => [dy.id, years.find((y) => y.label === dy.label)?.id ?? dy.id]),
    );
    return rows.filter((e) => e.visible).map((e) => ({ ...e, year_id: idFor.get(e.year_id) ?? e.year_id }));
  }
  return rows.filter((e) => e.visible);
});

/** Before migration 0006 posts have no category/cover/featured: default them. */
export const getNewsPosts = cache(async (): Promise<NewsPost[]> =>
  (await readTable<NewsPost>("news_posts", D.newsPosts, { column: "published_at", ascending: false }))
    .filter((p) => p.published)
    .map((p) => ({ ...p, category: p.category ?? "psu", cover_url: p.cover_url ?? "", featured: p.featured ?? false })),
);

/** Upcoming dates only (today onwards), soonest first. */
export const getKeyDates = cache(async (): Promise<KeyDate[]> => {
  const today = new Date().toISOString().slice(0, 10);
  return (await readTable<KeyDate>("key_dates", D.keyDates, { column: "date" }))
    .filter((d) => d.visible && String(d.date).slice(0, 10) >= today)
    .map((d) => ({ ...d, date: String(d.date).slice(0, 10) }));
});

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

/** Before migration 0004 there is no category column: those are About FAQs. */
export const getFaqs = cache(async (): Promise<Faq[]> =>
  (await readTable<Faq>("faqs", D.faqs))
    .filter((f) => f.visible)
    .map((f) => ({ ...f, category: f.category ?? "about" })),
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
  // Pages added after the database was seeded fall back to their starting copy.
  return rows.find((r) => r.path === path) ?? D.pageSeo.find((r) => r.path === path) ?? null;
});

export const getLegalPage = cache(async (slug: string): Promise<LegalPage | null> => {
  const rows = await readTable<LegalPage>("legal_pages", D.legalPages, { column: "slug" });
  return rows.find((r) => r.slug === slug) ?? null;
});
