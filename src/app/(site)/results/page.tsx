import type { Metadata } from "next";
import PressStrip from "@/components/about/PressStrip";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ChampionsWall from "@/components/results/ChampionsWall";
import RankLadder from "@/components/results/RankLadder";
import ResultsHero from "@/components/results/ResultsHero";
import FinalCta from "@/components/site/FinalCta";
import {
  getPageSeo,
  getPressStripImages,
  getResultEntries,
  getSiteSettings,
  getTestimonials,
  getVisibleResultYears,
} from "@/lib/content";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/results");
  return {
    title: seo?.meta_title,
    description: seo?.meta_description,
    alternates: { canonical: "/results" },
  };
}

/**
 * Results (SRS 7.4) - redesigned Nov 2026 after looking at how the national
 * GATE institutes present a results year.
 *
 *   1. Hero      - the year's top three on a podium with their own faces, and
 *                  a ladder of rank milestones worked out from the entries.
 *   2. Ladder    - every ranked student plotted on an AIR scale.
 *   3. Wall      - every student as a face card: year tabs, rank filters,
 *                  name search, the original post a tap away, and an open
 *                  "your name here" seat that books the free demo.
 *   4. Press     - the newspaper coverage.
 *   5. Stories   - testimonials ("prove it with stories", kept separate from
 *                  the numbers as SRS 7.4 asks), then the closing CTA.
 *
 * Everything is driven by the Results page entries in admin (year, name,
 * AIR, branch, photo). Faces are cut from each student's success post.
 */
export default async function ResultsPage() {
  const [years, entries, testimonials, settings, press] = await Promise.all([
    getVisibleResultYears(),
    getResultEntries(),
    getTestimonials("results"),
    getSiteSettings(),
    getPressStripImages(),
  ]);

  // Every year with results, together, by default (client request): the
  // hero, the ladder and the wall's first tab all cover all of them, and each
  // face carries its year. "GATE 2025 – 2026" style label for the range.
  const withResults = years.filter((y) => entries.some((e) => e.year_id === y.id));
  const shown = entries.filter((e) => withResults.some((y) => y.id === e.year_id));
  const yearNums = withResults.map((y) => y.year).sort((a, b) => a - b);
  const rangeLabel =
    yearNums.length === 0
      ? years[0]?.label ?? "GATE"
      : yearNums.length === 1
        ? withResults[0].label
        : `GATE ${yearNums[0]} – ${yearNums[yearNums.length - 1]}`;
  const yearOf = Object.fromEntries(years.map((y) => [y.id, y.label]));

  return (
    <>
      <ResultsHero
        entries={shown}
        yearLabel={rangeLabel}
        yearOf={yearOf}
        statLine={settings.stat_line}
      />

      {shown.length > 0 && <RankLadder entries={shown} yearLabel={rangeLabel} yearOf={yearOf} />}

      <ChampionsWall years={years} entries={entries} />

      <PressStrip images={press} />

      <TestimonialsSection
        testimonials={testimonials}
        showViewAll={false}
        eyebrow="In their words"
        title="What Our Students Say"
      />

      <FinalCta
        heading="Your rank could be on this page next year."
        buttonLabel="Talk to us"
        source="Results page CTA"
      />
    </>
  );
}
