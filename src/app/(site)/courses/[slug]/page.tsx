import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FaqAccordion from "@/components/about/FaqAccordion";
import BatchList from "@/components/courses/BatchList";
import BranchArt from "@/components/courses/BranchArt";
import CourseCard from "@/components/courses/CourseCard";
import CourseHeroActions from "@/components/courses/CourseHeroActions";
import CourseHeroCard from "@/components/courses/CourseHeroCard";
import CourseMobileBar from "@/components/courses/CourseMobileBar";
import CourseSectionNav from "@/components/courses/CourseSectionNav";
import DemoCtaBand from "@/components/courses/DemoCtaBand";
import ExamPattern from "@/components/courses/ExamPattern";
import {
  GpscAbout,
  GpscClasses,
  GpscExamPattern,
  GpscOfficialDocs,
  GpscProgram,
} from "@/components/courses/gpsc/GpscSections";
import SyllabusAccordion from "@/components/courses/SyllabusAccordion";
import { SyllabusDownloadCard } from "@/components/courses/SyllabusDownload";
import DemoVideoTile from "@/components/home/DemoVideoTile";
import MentorsSection from "@/components/home/MentorsSection";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  getBatchesForBranchCode,
  getBranches,
  getCourse,
  getCourses,
  getCourseSubjects,
  getFaqs,
  getMentors,
  getPedagogyPoints,
} from "@/lib/content";
import { DEMO_VIDEO_ID, DEMO_VIDEO_START } from "@/lib/defaults";
import { GPSC_FAQS } from "@/lib/gpsc";
import type { Faq } from "@/lib/types";
import { toLines } from "@/lib/utils";

/** Content comes from the database; see the note on the homepage. */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return {};
  return {
    title: course.meta_title || course.title,
    description: course.meta_description || course.tagline,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

/**
 * One course (/courses/<slug>) - the full detail a student needs to decide:
 * what is taught, how GATE is marked, every upcoming batch with its fee, the
 * mentors, proof, and questions - with the free demo as the constant way in.
 *
 * Replaces the old "Know about the batch" popup. A GATE course lists every
 * visible batch of its branch (classroom and online together); the GPSC course
 * has no branch, so it shows the enquiry route instead.
 */
export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const [subjects, batches, branches, mentors, faqs, pedagogy, allCourses] = await Promise.all([
    getCourseSubjects(course.id),
    getBatchesForBranchCode(course.branch_code),
    getBranches(),
    getMentors(),
    getFaqs(),
    getPedagogyPoints(),
    getCourses(),
  ]);

  const branch = branches.find((b) => b.code === course.branch_code) ?? null;
  const branchOption = branch ? `${branch.name} (${branch.code})` : undefined;
  const isGate = course.category === "gate";
  const isGpsc = course.category === "gpsc";
  const highlights = toLines(course.highlights);
  const whoFor = toLines(course.who_should_join);
  const fees = batches.map((b) => Number(b.fees ?? 0)).filter((f) => f > 0);
  const fromFee = fees.length ? Math.min(...fees) : null;
  const demo = batches.find((b) => b.video_id);
  const modes = Array.from(new Set(batches.map((b) => b.mode)));
  const code = isGate ? course.branch_code : "GPSC";

  const related = await Promise.all(
    allCourses
      .filter((c) => c.slug !== course.slug)
      .slice(0, 3)
      .map(async (c) => ({ course: c, batches: await getBatchesForBranchCode(c.branch_code) })),
  );

  const sections = isGpsc
    ? [
        { id: "overview", label: "Overview" },
        { id: "about-gpsc", label: "What is GPSC" },
        { id: "classes", label: "Class 1 · 2 · 3" },
        { id: "exam-pattern", label: "Exam pattern" },
        ...(subjects.length ? [{ id: "syllabus", label: "Syllabus" }] : []),
        { id: "how-it-works", label: "Our classes" },
        { id: "batches", label: "Batches & fees" },
        { id: "faq", label: "FAQs" },
      ]
    : [
    { id: "overview", label: "Overview" },
    ...(subjects.length ? [{ id: "syllabus", label: "Syllabus" }] : []),
    ...(isGate ? [{ id: "exam-pattern", label: "Exam pattern" }] : []),
    { id: "batches", label: "Batches & fees" },
    ...(mentors.length ? [{ id: "mentors", label: "Mentors" }] : []),
    { id: "faq", label: "FAQs" },
  ];

  // GPSC: its own questions first, then fees and the demo.
  const gpscFaqs: Faq[] = GPSC_FAQS.map((f, i) => ({
    id: `gpsc-faq-${i + 1}`,
    category: "courses",
    question: f.q,
    answer: f.a,
    visible: true,
    sort_order: i + 1,
  }));
  const courseFaqs = isGpsc
    ? [...gpscFaqs, ...faqs.filter((f) => ["fees", "demo"].includes(f.category)).slice(0, 2)]
    : faqs.filter((f) => ["courses", "fees", "demo"].includes(f.category)).slice(0, 8);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.meta_description || course.tagline,
    provider: { "@type": "EducationalOrganization", name: "Acumen Gate Academy" },
    ...(fromFee
      ? { offers: { "@type": "Offer", price: fromFee, priceCurrency: "INR", category: "Paid" } }
      : {}),
    hasCourseInstance: batches.map((b) => ({
      "@type": "CourseInstance",
      name: b.title || undefined,
      courseMode: b.mode === "offline" ? "Onsite" : "Online",
      location: b.mode === "offline" ? "Vadodara, Gujarat" : undefined,
    })),
  };

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative isolate overflow-hidden bg-charcoal bg-dark-sheen text-white">
        <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.045]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 hidden w-[620px] -translate-y-1/2 opacity-60 lg:block">
          <BranchArt code={code} tone="dark" className="w-full" />
        </div>

        <div className="container-site relative grid gap-10 py-10 md:py-14 lg:grid-cols-[1.2fr_minmax(340px,400px)] lg:items-center lg:py-20">
          <div>
            <Reveal>
              <nav aria-label="Breadcrumb" className="text-sm text-white/55">
                <Link href="/" className="hover:text-white">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/courses" className="hover:text-white">Courses</Link>
                <span className="mx-2">/</span>
                <span className="text-white/85">{course.short_title || course.title}</span>
              </nav>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-red px-2.5 py-1 font-display text-sm font-extrabold tracking-wide text-white shadow-red-glow">
                  {code}
                </span>
                {modes.map((m) => (
                  <span key={m} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 ring-1 ring-white/15">
                    {m === "offline" ? "Classroom · Vadodara" : "Live online"}
                  </span>
                ))}
                {isGate && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 ring-1 ring-white/15">
                    Complete GATE syllabus
                  </span>
                )}
                {isGpsc &&
                  ["Class 1 & Class 2 posts", "AE · DyEE · GES", "Official GPSC syllabus"].map((t) => (
                    <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 ring-1 ring-white/15">
                      {t}
                    </span>
                  ))}
              </div>

              <h1 className="mt-5 text-display-lg text-white">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{course.tagline}</p>
            </Reveal>

            {/* Phone/tablet: the artwork sits here, under the title. */}
            <div className="mx-auto mt-4 w-full max-w-[190px] sm:max-w-[260px] lg:hidden">
              <BranchArt code={code} tone="dark" className="w-full" />
            </div>

            <Reveal delay={120}>
              <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {(isGpsc
                  ? [
                      { k: "Stages", v: "3" },
                      { k: "Classes", v: "1 · 2 · 3" },
                      { k: "Subjects", v: subjects.length ? String(subjects.length) : "-" },
                      { k: "Branches", v: "CE · ME · EE" },
                    ]
                  : [
                      { k: "Subjects", v: subjects.length ? String(subjects.length) : "-" },
                      { k: "Topics", v: String(subjects.reduce((n, s) => n + toLines(s.topics).length, 0) || "-") },
                      { k: "Batches", v: batches.length ? String(batches.length) : "Soon" },
                      { k: "Duration", v: batches[0]?.duration || "12 months" },
                    ]
                ).map((f) => (
                  <div key={f.k} className="rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{f.k}</dt>
                    <dd className="mt-1 font-display text-xl font-extrabold text-white">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <CourseHeroActions
              courseTitle={course.title}
              branchOption={branchOption}
              syllabusUrl={course.syllabus_pdf_url}
              showCountdown={isGate}
              syllabusLabel={isGpsc ? "Official GPSC syllabus" : undefined}
            />
          </div>

          <div className="lg:justify-self-end lg:w-full">
            <CourseHeroCard batches={batches} courseTitle={course.title} branchOption={branchOption} />
          </div>
        </div>
      </section>

      <CourseSectionNav sections={sections} />

      {/* -------------------------------------------------------- overview */}
      <section id="overview" className="section scroll-mt-40">
        <div className="container-site grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
                Course overview
              </p>
              <h2 className="h-section mt-5">What this course does for you</h2>
              <p className="mt-5 text-[15px] leading-relaxed text-body sm:text-base">{course.overview}</p>
            </Reveal>

            {highlights.length > 0 && (
              <ul className="mt-8 space-y-3">
                {highlights.map((h, i) => (
                  <Reveal as="li" key={h} delay={i * 70} variant="left">
                    <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-4 shadow-chip">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red text-white">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M4.5 10.5l3.5 3.5L15.5 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-[15px] font-medium leading-snug text-charcoal">{h}</span>
                    </div>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            <Reveal variant="right">
              <DemoVideoTile
                videoId={demo?.video_id || DEMO_VIDEO_ID}
                start={demo?.video_id ? demo.video_start : DEMO_VIDEO_START}
                title={`${course.title} - demo lecture`}
                caption="Watch a demo lecture"
              />
            </Reveal>

            {whoFor.length > 0 && (
              <Reveal variant="right" delay={100}>
                <div className="rounded-3xl bg-offwhite p-6 sm:p-7">
                  <h3 className="text-lg">Who should join</h3>
                  <ul className="mt-4 space-y-3">
                    {whoFor.map((w) => (
                      <li key={w} className="flex items-start gap-3 text-[15px] leading-snug text-body">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {pedagogy.length > 0 && (
          <div className="container-site mt-14">
            <Reveal>
              <h3 className="font-display text-display-sm">Included in every batch</h3>
            </Reveal>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {pedagogy.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 45} variant="pop">
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-chip transition-colors hover:border-red/40">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-red" />
                    {p.text}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </section>

      {isGpsc && (
        <>
          <GpscAbout />
          <GpscClasses />
          <GpscExamPattern />
        </>
      )}

      {/* -------------------------------------------------------- syllabus */}
      {subjects.length > 0 && (
        <section id="syllabus" className={`section scroll-mt-40 ${isGpsc ? "" : "section-alt"}`}>
          <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal variant="left" className="lg:sticky lg:top-40 lg:self-start">
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
                Syllabus
              </p>
              <h2 className="h-section mt-5">Everything the {course.short_title || "course"} paper asks</h2>
              <p className="lede mt-4">
                {isGate
                  ? "Subject by subject, with the marks each one typically carries in recent GATE papers - so you can see where the paper's weight really sits."
                  : "General studies, engineering aptitude, your branch and the mains language papers - condensed from the official GPSC syllabus, with the stage each one belongs to."}
              </p>
              {isGate && (
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  Subjects and topics follow the official GATE 2027 syllabus. Marks are Acumen&apos;s approximate
                  estimates from recent papers and vary from year to year.
                </p>
              )}
              {isGpsc ? (
                <GpscOfficialDocs />
              ) : (
                <SyllabusDownloadCard url={course.syllabus_pdf_url} paper={course.title} />
              )}
            </Reveal>
            <SyllabusAccordion subjects={subjects} />
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- exam pattern */}
      {isGate && (
        <section id="exam-pattern" className="section scroll-mt-40">
          <div className="container-site">
            <SectionHeading
              eyebrow="Exam pattern"
              title={`How the GATE ${course.branch_code === "CSE" ? "CS" : course.branch_code} paper is marked`}
              lede="Three hours, 65 questions, 100 marks - and negative marking only on multiple choice."
            />
            <div className="mt-10">
              <ExamPattern paperName={course.title} />
            </div>
          </div>
        </section>
      )}

      {isGpsc && <GpscProgram alt />}

      {/* --------------------------------------------------------- batches */}
      <section id="batches" className={`section scroll-mt-40 ${isGpsc ? "" : "section-alt"}`}>
        <div className="container-site">
          <SectionHeading
            eyebrow="Batches & fees"
            title="Pick the batch that fits your week"
            lede="Every fee is the full amount you pay, GST included. Enroll and pay online, or book a free demo class first."
          />
          <div className="mt-10">
            <BatchList batches={batches} branch={branch} />
          </div>
        </div>
      </section>

      <DemoCtaBand
        source={`Course page band: ${course.title}`}
        heading={`Try a ${course.short_title || "GATE"} class for free.`}
        branch={branchOption}
      />

      {mentors.length > 0 && (
        <div id="mentors" className="scroll-mt-40">
          <MentorsSection mentors={mentors} />
        </div>
      )}


      <div id="faq" className="scroll-mt-40">
        <FaqAccordion
          faqs={courseFaqs}
          heading={isGpsc ? "GPSC questions, answered" : "Before you enroll"}
          lede={
            isGpsc
              ? "Eligibility, the classes of posts, negative marking, and preparing for GATE and GPSC together."
              : "Batches, fees and GST, and what happens in a free demo class."
          }
        />
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="container-site">
            <SectionHeading
              eyebrow="Explore more"
              title="Other courses"
              action={
                <Link href="/courses" className="btn-secondary btn-sm">
                  All courses
                </Link>
              }
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.course.id} delay={i * 90} distance="lg" className="h-full">
                  <CourseCard data={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CourseMobileBar
        fromFee={fromFee}
        courseTitle={course.title}
        branchOption={branchOption}
        hasBatches={batches.length > 0}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
