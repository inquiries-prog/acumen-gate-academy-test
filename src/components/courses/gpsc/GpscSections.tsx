import Link from "next/link";
import BranchArt from "@/components/courses/BranchArt";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  GPSC_ABOUT,
  GPSC_CLASSES,
  GPSC_DEPARTMENTS,
  GPSC_ELIGIBILITY,
  GPSC_OFFICIAL_DOCS,
  GPSC_OJAS,
  GPSC_PROGRAM,
  GPSC_SITE,
  GPSC_SYLLABUS_PAGE,
} from "@/lib/gpsc";
import GpscPattern from "./GpscPattern";

/**
 * The sections only the GPSC course page has: what GPSC is, the classes of
 * posts, the exam pattern, how our classes run and the official PDFs.
 * Content lives in src/lib/gpsc.ts.
 */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
      {children}
    </p>
  );
}

function ExternalArrow({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M7 13L13 7m0 0H8m5 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "What is GPSC?" with the key facts and the departments that hire. */
export function GpscAbout() {
  return (
    <section id="about-gpsc" className="section section-alt scroll-mt-40">
      <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <Reveal variant="left">
          <Eyebrow>About the exam</Eyebrow>
          <h2 className="h-section mt-5">{GPSC_ABOUT.heading}</h2>
          {GPSC_ABOUT.body.map((p) => (
            <p key={p} className="mt-4 text-[15px] leading-relaxed text-body sm:text-base">
              {p}
            </p>
          ))}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={GPSC_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-red hover:underline"
            >
              gpsc.gujarat.gov.in <ExternalArrow />
            </a>
            <a
              href={GPSC_OJAS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-red hover:underline"
            >
              Apply on GPSC-OJAS <ExternalArrow />
            </a>
          </div>
        </Reveal>

        <Reveal variant="right" delay={100}>
          <div className="relative isolate overflow-hidden rounded-3xl bg-charcoal bg-dark-sheen p-6 text-white shadow-lifted sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 w-56 opacity-40">
              <BranchArt code="GPSC" tone="dark" className="w-full" />
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-red/30 blur-3xl animate-glow-b" />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">GPSC at a glance</p>
            <dl className="relative mt-5 grid grid-cols-2 gap-3">
              {GPSC_ABOUT.facts.map((f, i) => (
                <div
                  key={f.k}
                  className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 animate-pop"
                  style={{ animationDelay: `${200 + i * 90}ms` }}
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{f.k}</dt>
                  <dd className="mt-1.5 font-display text-[15px] font-extrabold leading-snug text-white sm:text-base">{f.v}</dd>
                </div>
              ))}
            </dl>
            <p className="relative mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
              Eligibility · engineering service
            </p>
            <dl className="relative mt-3 space-y-2.5">
              {GPSC_ELIGIBILITY.map((e) => (
                <div key={e.k} className="flex gap-3 text-sm">
                  <dt className="w-[5.5rem] shrink-0 font-bold text-white">{e.k}</dt>
                  <dd className="leading-snug text-white/70">{e.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>

      <div className="container-site mt-12">
        <Reveal>
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Departments that recruited engineers through recent GPSC notices
          </p>
        </Reveal>
        <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
          {GPSC_DEPARTMENTS.map((d, i) => (
            <Reveal as="li" key={d} delay={i * 40} variant="pop">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-chip">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-red" />
                {d}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Class 1, 2 and 3: what each means and the posts in it. */
export function GpscClasses() {
  return (
    <section id="classes" className="section scroll-mt-40">
      <div className="container-site">
        <SectionHeading
          align="center"
          eyebrow="Classes of posts"
          title="Class 1, 2 or 3: where you can start"
          lede="Classes are levels of state service, not separate exams. Here is what each one means, with engineering and other example posts."
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {GPSC_CLASSES.map((c, i) => {
            const main = i === 1;
            return (
              <Reveal as="li" key={c.name} delay={i * 110} distance="lg" className="h-full">
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition-all duration-300 ease-smooth hover:-translate-y-1 sm:p-7 ${
                    main ? "border-red/40 bg-white shadow-lifted ring-1 ring-red/20" : "border-line bg-white shadow-card"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute right-5 -top-5 font-display text-[8rem] font-extrabold leading-none ${
                      main ? "text-red/[0.08]" : "text-charcoal/[0.05]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`relative self-start rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
                      main ? "bg-red text-white shadow-red-glow" : "bg-charcoal text-white"
                    }`}
                  >
                    {c.tag}
                  </span>
                  <h3 className="relative mt-4 font-display text-2xl font-extrabold text-charcoal">{c.name}</h3>
                  <p className="relative mt-2 text-[15px] leading-relaxed text-body">{c.summary}</p>
                  <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-red">For engineers</p>
                  <ul className="relative mt-2.5 space-y-2">
                    {c.engineering.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm font-semibold leading-snug text-charcoal">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red/10 text-red">
                          <svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4.5 10.5l3.5 3.5L15.5 6" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Other posts</p>
                  <p className="relative mt-1.5 text-sm leading-snug text-body">{c.other.join(" · ")}</p>
                  <div className="relative mt-auto pt-6">
                    <p className="rounded-xl bg-offwhite px-3.5 py-2.5 text-xs font-semibold text-charcoal">
                      {c.pay ? (
                        <>
                          Pay: {c.pay}
                          <span className="block font-normal text-muted">GES Civil 2026-27 notice, before allowances</span>
                        </>
                      ) : (
                        "Pay, eligibility and pattern depend on the post"
                      )}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The exam pattern, with the AE / GES switch. */
export function GpscExamPattern() {
  return (
    <section id="exam-pattern" className="section section-alt scroll-mt-40">
      <div className="container-site">
        <SectionHeading
          align="center"
          eyebrow="Exam pattern"
          title="How GPSC selects its officers"
          lede="Objective prelims to screen, descriptive mains and an interview to rank. Pick the exam you are aiming for."
        />
        <div className="mt-10">
          <GpscPattern />
        </div>
      </div>
    </section>
  );
}

/** How Acumen's GPSC classes run, in four steps. */
export function GpscProgram({ alt = false }: { alt?: boolean }) {
  return (
    <section id="how-it-works" className={`section scroll-mt-40 ${alt ? "section-alt" : ""}`}>
      <div className="container-site">
        <SectionHeading
          eyebrow="Our GPSC classes"
          title="How the course is taught"
          lede="One plan for both halves of the exam, so general studies never falls behind the technical paper."
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GPSC_PROGRAM.map((s, i) => (
            <Reveal as="li" key={s.step} delay={i * 90} distance="lg" className="h-full">
              <div className="group relative h-full rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-red/30 hover:shadow-card-hover">
                <span className="font-display text-4xl font-extrabold text-red/20 transition-colors duration-300 group-hover:text-red">
                  {s.step}
                </span>
                <h3 className="mt-3 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Official syllabus PDFs, for the syllabus section's side column. */
export function GpscOfficialDocs() {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red">Official GPSC syllabus PDFs</p>
      <ul className="mt-3 divide-y divide-line">
        {GPSC_OFFICIAL_DOCS.map((d) => (
          <li key={d.url}>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 py-2.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red/10 text-[10px] font-extrabold text-red transition-colors group-hover:bg-red group-hover:text-white">
                PDF
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-snug text-charcoal group-hover:text-red">{d.title}</span>
                <span className="block text-[11px] text-muted">{d.detail}</span>
              </span>
              <ExternalArrow className="shrink-0 text-red" />
            </a>
          </li>
        ))}
      </ul>
      <a
        href={GPSC_SYLLABUS_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary btn-sm mt-3 w-full"
      >
        Every syllabus on gpsc.gujarat.gov.in
      </a>
    </div>
  );
}

/**
 * A wide band for /courses and the homepage, so GPSC stands out as its own
 * exam instead of being one card among the GATE branches.
 */
export function GpscSpotlight({ slug }: { slug: string }) {
  return (
    <Reveal distance="lg">
      <div className="relative isolate grid items-center gap-8 overflow-hidden rounded-[2rem] bg-charcoal bg-dark-sheen p-6 text-white shadow-lifted sm:p-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-red/35 blur-3xl animate-glow-b" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
            Gujarat state government jobs
          </p>
          <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white sm:text-4xl">
            GPSC coaching for engineers
          </h3>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            Assistant Engineer, Deputy Executive Engineer and the Gujarat Engineering Service, Class 1 &amp; 2. General
            studies, Gujarati and your branch, on the official GPSC syllabus.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {["What GPSC is", "Class 1 · 2 · 3 explained", "Exam pattern & marks", "Official syllabus PDFs"].map((t) => (
              <li key={t} className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/10">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={`/courses/${slug}`} className="btn-onDark">
              Explore the GPSC course
            </Link>
            <Link href={`/courses/${slug}#exam-pattern`} className="btn border border-white/25 text-white hover:-translate-y-0.5 hover:bg-white/10">
              See the exam pattern
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[280px] lg:max-w-[340px]">
          <BranchArt code="GPSC" tone="dark" className="w-full" />
        </div>
      </div>
    </Reveal>
  );
}
