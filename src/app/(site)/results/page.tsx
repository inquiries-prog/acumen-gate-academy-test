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

  // The hero and ladder feature the latest year that has results.
  const featured = years.find((y) => entries.some((e) => e.year_id === y.id));
  const featuredEntries = featured ? entries.filter((e) => e.year_id === featured.id) : [];

  return (
    <>
      <ResultsHero
        entries={featuredEntries}
        yearLabel={featured?.label ?? years[0]?.label ?? "GATE"}
        statLine={settings.stat_line}
      />

      {featured && <RankLadder entries={featuredEntries} yearLabel={featured.label} />}

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
