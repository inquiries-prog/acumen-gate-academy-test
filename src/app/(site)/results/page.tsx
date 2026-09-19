import type { Metadata } from "next";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ResultsGallery from "@/components/results/ResultsGallery";
import ResultsTabs from "@/components/results/ResultsTabs";
import FinalCta from "@/components/site/FinalCta";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Reveal from "@/components/ui/Reveal";
import {
  getGalleryImages,
  getPageSeo,
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
 * Results (SRS 7.4).
 *
 * Three sections, kept deliberately separate: the data-forward results grid
 * ("prove it with numbers"), the narrative testimonials ("prove it with
 * stories"), and a closing CTA. The two proof sections are not merged - the SRS
 * asks for both jobs to be served distinctly.
 */
export default async function ResultsPage() {
  const [years, entries, testimonials, settings, gallery] = await Promise.all([
    getVisibleResultYears(),
    getResultEntries(),
    getTestimonials("results"),
    getSiteSettings(),
    getGalleryImages(),
  ]);

  const resultPosts = gallery.filter((image) => image.kind === "result");

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line bg-white">
        <AmbientGlow />
        <div className="container-site relative py-16 md:py-24">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              Results
            </p>
            <h1 className="mt-6 text-display-lg">Our students&apos; GATE results</h1>
            {/* Reuses the one site-wide headline number - no second total. */}
            <p className="mt-6 font-display text-2xl font-extrabold text-gradient-red sm:text-3xl">
              {settings.stat_line}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Section 1 - GATE Results */}
      <ResultsTabs years={years} entries={entries} />

      {/* The rest of the result-post archive that the homepage doesn't show. */}
      <div className="section-alt">
        <ResultsGallery images={resultPosts} />
      </div>

      {/* Section 2 - What Our Students Say */}
      <TestimonialsSection
        testimonials={testimonials}
        showViewAll={false}
        eyebrow="In their words"
        title="What Our Students Say"
      />

      {/* Section 3 - Closing CTA */}
      <FinalCta
        heading="Your rank could be on this page next year."
        buttonLabel="Talk to us"
        source="Results page CTA"
      />
    </>
  );
}
