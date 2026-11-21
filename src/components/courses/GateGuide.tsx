import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { GATE_CAREER_PATHS, GATE_ELIGIBILITY, GATE_TIMELINE } from "@/lib/gate-info";
import ExamPattern from "./ExamPattern";

/**
 * "Everything about GATE": eligibility, the exam pattern, a typical year's
 * timeline, and where a score leads. The explainer a first-time visitor needs
 * before any course makes sense, and the content that earns search traffic
 * for "GATE exam pattern" style queries.
 */
export default function GateGuide({ id = "about-gate" }: { id?: string }) {
  return (
    <>
      <section id={id} className="section scroll-mt-28">
        <div className="container-site">
          <SectionHeading
            eyebrow="About the GATE exam"
            title={
              <>
                One exam. <span className="text-gradient-red">Four career routes.</span>
              </>
            }
            lede="GATE is the national exam behind M.Tech admissions at the IITs and IISc, PSU recruitment and research fellowships. Here is how it works."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {GATE_ELIGIBILITY.map((item, i) => (
              <Reveal key={item} delay={i * 80}>
                <div className="flex h-full items-start gap-3.5 rounded-2xl border border-line bg-white p-5 shadow-chip">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <p className="text-[15px] font-semibold leading-snug text-charcoal">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 md:mt-20">
            <Reveal>
              <h3 className="font-display text-display-sm">The exam pattern</h3>
              <p className="lede mt-2 max-w-2xl">
                How the 100 marks split, and how each type of question is marked.
              </p>
            </Reveal>
            <div className="mt-8">
              <ExamPattern />
            </div>
          </div>
        </div>
      </section>

      <section className="section relative isolate overflow-hidden bg-charcoal bg-dark-sheen text-white">
        <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.04]" />
        <div className="container-site relative">
          <SectionHeading
            tone="dark"
            eyebrow="A typical GATE year"
            title="From registration to results"
            lede="Exact dates change every year and are announced by the organising IIT. This is the usual rhythm."
          />

          <ol className="relative mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* The connecting line on wide screens. */}
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent lg:block"
            />
            {GATE_TIMELINE.map((step, i) => (
              <Reveal as="li" key={step.what} delay={i * 90} className="relative">
                <span
                  className={`relative z-10 grid h-11 w-11 place-items-center rounded-full font-display text-sm font-extrabold ring-4 ring-charcoal ${
                    step.what === "Exam days" ? "bg-red text-white shadow-red-glow" : "bg-white text-charcoal"
                  }`}
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-red">{step.when}</p>
                <p className="mt-1 font-display text-lg font-bold text-white">{step.what}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{step.detail}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-site">
          <SectionHeading
            eyebrow="Where a GATE score takes you"
            title="Why a good rank matters"
            lede="A single well-prepared attempt can open more than one door at once."
            action={
              <Link href="/news" className="btn-secondary btn-sm">
                Latest recruitment news
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GATE_CAREER_PATHS.map((path, i) => (
              <Reveal key={path.title} delay={i * 90} distance="lg">
                <article className="card-interactive group h-full p-6">
                  <span className="icon-tile group-hover:bg-red group-hover:text-white">
                    <CareerIcon icon={path.icon} />
                  </span>
                  <h3 className="mt-5 text-lg">{path.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">{path.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CareerIcon({ icon }: { icon: (typeof GATE_CAREER_PATHS)[number]["icon"] }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  switch (icon) {
    case "cap":
      return (
        <svg {...common}>
          <path d="M2 9l10-5 10 5-10 5L2 9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-3v19M12 8l8 3v10M2 21h20M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M7.5 15h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 12l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
