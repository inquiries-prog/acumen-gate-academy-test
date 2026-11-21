import type { Metadata } from "next";
import Carousel from "@/components/home/Carousel";
import BranchArt from "@/components/courses/BranchArt";
import CoursesExplorer from "@/components/courses/CoursesExplorer";
import CoursesHeroActions from "@/components/courses/CoursesHeroActions";
import DemoCtaBand from "@/components/courses/DemoCtaBand";
import GateGuide from "@/components/courses/GateGuide";
import FaqAccordion from "@/components/about/FaqAccordion";
import ComparisonTable from "@/components/home/ComparisonTable";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  getBatchesForBranchCode,
  getCarouselImages,
  getCourses,
  getFaqs,
  getPageSeo,
  getPedagogyPoints,
} from "@/lib/content";
import { HERO_RANKS, HERO_RANKS_LABEL } from "@/lib/defaults";

/** Content comes from the database; see the note on the homepage. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/courses");
  return {
    title: seo?.meta_title,
    description: seo?.meta_description,
    alternates: { canonical: "/courses" },
  };
}

/**
 * All courses (/courses) - replaces the old "Offline Courses" and "Online
 * Courses" popups with one page. ?mode=offline / ?mode=online pre-select the
 * format, which is where the header menu and homepage cards link.
 *
 * Order: hero -> course grid -> what every batch includes -> classroom vs
 * online -> proof (results wall) -> everything about GATE -> FAQs -> demo CTA.
 */
export default async function CoursesPage() {
  const [courses, pedagogy, carousel, faqs] = await Promise.all([
    getCourses(),
    getPedagogyPoints(),
    getCarouselImages(),
    getFaqs(),
  ]);

  const items = await Promise.all(
    courses.map(async (course) => ({ course, batches: await getBatchesForBranchCode(course.branch_code) })),
  );

  const gateCodes = courses.filter((c) => c.category === "gate").map((c) => c.branch_code);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.title,
        description: c.tagline,
        url: `/courses/${c.slug}`,
        provider: { "@type": "EducationalOrganization", name: "Acumen Gate Academy" },
      },
    })),
  };

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-line bg-white">
        <AmbientGlow fadeBottom />
        <div className="container-site relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <Reveal>
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
                Courses · GATE &amp; GPSC
              </p>
              <h1 className="mt-6 text-display-xl">
                Your branch. Your pace. <span className="text-gradient-red">Your GATE rank.</span>
              </h1>
              <p className="lede mt-5 max-w-xl text-base sm:text-lg">
                Six GATE branches and GPSC coaching - in our Vadodara classrooms or live online, on the same
                nine-point structure, with mentors who know you by name.
              </p>
            </Reveal>
            <CoursesHeroActions />
            <Reveal delay={200} className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{HERO_RANKS_LABEL}</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {HERO_RANKS.map((rank, i) => (
                  <li
                    key={rank}
                    className="rounded-full border border-line bg-white px-3 py-1.5 font-display text-sm font-extrabold text-charcoal shadow-chip animate-pop"
                    style={{ animationDelay: `${400 + i * 70}ms` }}
                  >
                    AIR <span className="text-red">{rank}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Branch artwork constellation */}
          <Reveal variant="scale" delay={120} className="relative mx-auto hidden aspect-square w-full max-w-[520px] sm:block">
            <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-red/10 to-transparent" />
            <div className="absolute inset-[22%] grid place-items-center rounded-full border border-line bg-white shadow-lifted">
              <BranchArt code="GPSC" className="h-[78%] w-[78%]" />
            </div>
            {gateCodes.slice(0, 6).map((code, i) => {
              const angle = (i / Math.min(gateCodes.length, 6)) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 40;
              const y = 50 + Math.sin(angle) * 40;
              return (
                <div
                  key={code}
                  className="absolute h-[23%] w-[23%] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className="relative h-full w-full rounded-2xl border border-line bg-white p-1 shadow-card animate-float"
                    style={{ animationDelay: `${i * -1.1}s` }}
                  >
                    <BranchArt code={code} className="h-full w-full" />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-charcoal px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white">
                      {code}
                    </span>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Course grid */}
      <section id="all-courses" className="section scroll-mt-28">
        <div className="container-site">
          <SectionHeading
            align="center"
            eyebrow="Choose your course"
            title="Every branch, classroom or online"
            lede="Switch formats to compare start dates and fees. Every fee shown includes GST."
            className="mb-10"
          />
          <CoursesExplorer items={items} />
        </div>
      </section>

      {/* What every batch includes */}
      <section className="section-tight section-alt">
        <div className="container-site">
          <SectionHeading
            eyebrow="In every batch"
            title="The same nine-point structure, whichever course you pick"
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pedagogy.map((point, i) => (
              <Reveal as="li" key={point.id} delay={(i % 3) * 80}>
                <div className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-chip transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-red/25 hover:shadow-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red/[0.08] font-display text-sm font-extrabold text-red transition-colors duration-300 group-hover:bg-red group-hover:text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] font-semibold text-charcoal">{point.text}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Classroom vs online vs alone */}
      <section className="relative isolate overflow-hidden bg-charcoal bg-dark-sheen pb-14 pt-2 md:pb-20">
        <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.04]" />
        <div className="container-site relative">
          <ComparisonTable />
        </div>
      </section>

      {/* Proof */}
      <Carousel images={carousel} />

      <GateGuide />

      <FaqAccordion
        faqs={faqs.filter((f) => f.category === "courses" || f.category === "fees").slice(0, 7)}
        heading="Questions about courses"
        lede="Choosing a batch, fees and GST, and how the course fits around your degree."
      />

      <DemoCtaBand source="Courses page band" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
