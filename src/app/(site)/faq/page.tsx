import type { Metadata } from "next";
import DemoCtaBand from "@/components/courses/DemoCtaBand";
import FaqExplorer from "@/components/faq/FaqExplorer";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Reveal from "@/components/ui/Reveal";
import { getFaqs, getPageSeo } from "@/lib/content";
import { FAQ_CATEGORIES } from "@/lib/defaults";

/** Content comes from the database; see the note on the homepage. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/faq");
  return {
    title: seo?.meta_title ? { absolute: seo.meta_title } : undefined,
    description: seo?.meta_description,
    alternates: { canonical: "/faq" },
  };
}

/**
 * Frequently asked questions (/faq) - every question on the site, grouped by
 * category, searchable. The single home of the FAQPage structured data: the
 * About page and course pages show subsets without repeating the markup.
 */
export default async function FaqPage() {
  const faqs = await getFaqs();

  const schema = {
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
      <section className="relative isolate overflow-hidden border-b border-line bg-white">
        <AmbientGlow fadeBottom />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-10 hidden font-display text-[18rem] font-extrabold leading-none text-red/[0.04] lg:block">
          ?
        </div>
        <div className="container-site relative py-14 md:py-20">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              FAQ
            </p>
            <h1 className="mt-6 text-display-xl">
              Questions? <span className="text-gradient-red">Straight answers.</span>
            </h1>
            <p className="lede mt-5 max-w-2xl text-base sm:text-lg">
              The GATE exam, choosing a batch, fees and GST, online classes and the free demo class - everything
              students and parents ask us most.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-site">
          <FaqExplorer faqs={faqs} categories={FAQ_CATEGORIES} />
        </div>
      </section>

      <DemoCtaBand source="FAQ page band" heading="Still unsure? Sit in on a class." />

      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
    </>
  );
}
