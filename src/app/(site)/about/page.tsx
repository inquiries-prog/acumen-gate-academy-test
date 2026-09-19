import type { Metadata } from "next";
import CentersSection from "@/components/about/CentersSection";
import EcosystemTimeline from "@/components/about/EcosystemTimeline";
import FaqAccordion from "@/components/about/FaqAccordion";
import PedagogySection from "@/components/about/PedagogySection";
import PressStrip from "@/components/about/PressStrip";
import FinalCta from "@/components/site/FinalCta";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  getAboutBlocks,
  getCenters,
  getEcosystemCards,
  getFaqs,
  getPageSeo,
  getPedagogyPoints,
  getPressStripImages,
} from "@/lib/content";
import { toParagraphs } from "@/lib/utils";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/about");
  return {
    title: seo?.meta_title,
    description: seo?.meta_description,
    alternates: { canonical: "/about" },
  };
}

/**
 * About Us (SRS 7.2) - the primary SEO/GEO landing page and the deeper trust
 * page for serious prospects. Section order follows the SRS exactly.
 */
export default async function AboutPage() {
  const [blocks, ecosystem, pedagogy, centers, press, faqs] = await Promise.all([
    getAboutBlocks(),
    getEcosystemCards(),
    getPedagogyPoints(),
    getCenters(),
    getPressStripImages(),
    getFaqs(),
  ]);

  const opening = blocks.opening;
  const story = blocks.story;
  const different = blocks.different;

  // SRS 13: FAQ answers are written to be extracted, so mark them up as such.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      {/* 1. Opening Statement */}
      <section className="relative isolate overflow-hidden border-b border-line bg-white">
        <AmbientGlow />
        <div className="container-site relative py-16 md:py-24 lg:py-28">
          <Reveal className="max-w-4xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              About Us
            </p>
            <h1 className="mt-6 text-display-lg">
              {opening?.heading || "About Acumen Gate Academy"}
            </h1>
            {opening?.body && (
              <p className="mt-6 text-base leading-relaxed text-body sm:text-[17px]">
                {opening.body}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* 2. Our Story */}
      {story?.body && (
        <section className="section">
          <div className="container-site">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <Reveal className="lg:sticky lg:top-28 lg:self-start">
                <p className="eyebrow">
                  <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
                  Our Story
                </p>
                <h2 className="h-section mt-5">{story.heading || "Our Story"}</h2>
              </Reveal>

              <Reveal delay={80}>
                <div className="space-y-5 border-l-2 border-line pl-7">
                  {toParagraphs(story.body).map((p, i) => (
                    <p
                      key={i}
                      className={`leading-relaxed text-body ${
                        i === 0 ? "text-[17px] text-charcoal sm:text-lg" : "text-[15px] sm:text-base"
                      }`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* 3. Not Just Coaching - An Ecosystem */}
      <EcosystemTimeline cards={ecosystem} />

      {/* 4. Our Pedagogy - the full version; the homepage has none by design. */}
      <PedagogySection points={pedagogy} />

      {/* 5. What Makes Us Different */}
      {different?.body && (
        <section className="relative overflow-hidden bg-charcoal bg-dark-sheen">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid-texture opacity-[0.05]"
          />
          <div className="container-site relative py-16 md:py-24 lg:py-28">
            <SectionHeading
              eyebrow="Our Approach"
              tone="dark"
              title={different.heading || "What Makes Us Different"}
            />
            <Reveal delay={80} className="mt-10 grid gap-6 md:grid-cols-3">
              {toParagraphs(different.body).map((p, i) => (
                <p
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-[15px] leading-relaxed text-white/70"
                >
                  {p}
                </p>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. Our Centers */}
      <CentersSection centers={centers} />

      {/* 7. In the News */}
      <PressStrip images={press} />

      {/* 8. FAQ */}
      <FaqAccordion faqs={faqs} />

      {/* 9. Closing CTA */}
      <FinalCta
        heading="Still deciding? Talk to us."
        buttonLabel="Talk to us"
        source="About page CTA"
      />

      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
