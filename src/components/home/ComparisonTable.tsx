import Reveal from "@/components/ui/Reveal";

/**
 * Offline coaching vs a large online-only platform vs studying alone.
 *
 * This is the argument SRS 7.1.5 exists to make. The six cards above assert it;
 * this shows it, which is far more persuasive for a student who is genuinely
 * weighing a cheaper national platform against a Vadodara classroom.
 *
 * Two deliberate choices about the competitor columns:
 *   - no platform is named, and the language is hedged ("typically", "usually"),
 *     because these are category-level observations, not claims about a
 *     specific company;
 *   - nothing here is stated as a fact about a competitor's product that the
 *     client could not defend.
 *
 * The Acumen column is the only one that carries brand colour, so the eye lands
 * there first without the other two being disparaged visually.
 *
 * Copy lives in code rather than the database. If the client wants to reword it
 * himself later, it becomes a table plus one admin screen - the same pattern as
 * every other section.
 */

interface Row {
  feature: string;
  acumen: string;
  platform: string;
  alone: string;
}

const ROWS: Row[] = [
  {
    feature: "Batch size",
    acumen: "Small batches — your mentor knows your name",
    platform: "Typically thousands of learners per cohort",
    alone: "Just you",
  },
  {
    feature: "Reaching a mentor",
    acumen: "Call, message, or walk into our Vadodara centre",
    platform: "Usually a ticket queue or a discussion forum",
    alone: "No one to ask",
  },
  {
    feature: "Class schedule",
    acumen: "Built around your college end-sems and internals",
    platform: "Fixed national calendar, same for everyone",
    alone: "You plan it yourself",
  },
  {
    feature: "Tracking your progress",
    acumen: "A mentor who notices when you slip, and follows up",
    platform: "Dashboards and automated reminders",
    alone: "Self-assessed",
  },
  {
    feature: "Test series",
    acumen: "National level test series, included",
    platform: "Usually included",
    alone: "Bought separately",
  },
  {
    feature: "After the result",
    acumen: "Post-GATE guidance and admission support",
    platform: "Varies by plan",
    alone: "On your own",
  },
  {
    feature: "Placement support",
    acumen: "Through Acumen 360, our HR consultancy since 2008",
    platform: "Rarely part of a coaching subscription",
    alone: "None",
  },
];

const COLUMNS = ["Acumen (offline & live online)", "A large online-only platform", "Studying alone"];

export default function ComparisonTable() {
  return (
    <div className="mt-16">
      <Reveal className="max-w-2xl">
        <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
          Weighing us against a national online platform?
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-white/60">
          A fair look at what actually differs. The cheaper option is not always the one that gets
          you a rank.
        </p>
      </Reveal>

      {/* ---------------------------------------------------- desktop ---- */}
      <Reveal
        delay={80}
        variant="scale"
        className="group/table mt-8 hidden overflow-hidden rounded-2xl border border-white/10 lg:block"
      >
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Comparison of Acumen Gate Academy, a large online-only platform, and studying alone
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[22%] bg-white/[0.03] p-5" />
              {COLUMNS.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`p-5 align-bottom font-display text-sm font-bold ${
                    i === 0
                      ? "border-x border-red/40 bg-red/[0.14] text-white shadow-[inset_0_0_48px_rgba(227,30,36,0.22)]"
                      : "bg-white/[0.03] text-white/60"
                  }`}
                >
                  {i === 0 && (
                    <span className="mb-2 inline-block rounded-full bg-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                      Us
                    </span>
                  )}
                  <span className="block">{col}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, r) => (
              // Rows cascade in once the table reveals: each one transitions from
              // the wrapping Reveal's `opacity-100` with its own delay.
              <tr
                key={row.feature}
                className="translate-y-2 border-t border-white/10 opacity-0 transition-[transform,opacity] duration-500 ease-smooth
                           group-[.opacity-100]/table:translate-y-0 group-[.opacity-100]/table:opacity-100"
                style={{ transitionDelay: `${120 + r * 45}ms` }}
              >
                <th
                  scope="row"
                  className="bg-white/[0.03] p-5 align-top font-display text-sm font-bold text-white/80"
                >
                  {row.feature}
                </th>
                <td
                  className={`border-x border-red/40 bg-red/[0.08] p-5 align-top text-[14.5px] leading-relaxed text-white ${
                    r === ROWS.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <span className="flex gap-2.5">
                    <Tick />
                    {row.acumen}
                  </span>
                </td>
                <td className="p-5 align-top text-[14.5px] leading-relaxed text-white/55">
                  {row.platform}
                </td>
                <td className="p-5 align-top text-[14.5px] leading-relaxed text-white/55">
                  {row.alone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* ----------------------------------------------------- mobile ---- */}
      {/* A seven-row, four-column table cannot work on a phone, so below `lg`
          each feature becomes a compact card: Acumen's answer leads, and the
          two comparisons follow as single muted lines. The first version of
          this used three labelled blocks per feature and ran to ~2,200px on a
          phone - longer than every other homepage section combined. */}
      <div className="mt-8 space-y-2.5 lg:hidden">
        {ROWS.map((row, i) => (
          <Reveal
            key={row.feature}
            delay={(i % 3) * 60}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
              {row.feature}
            </p>
            <p className="mt-1.5 flex gap-2.5 text-[15px] font-medium leading-snug text-white">
              <Tick />
              {row.acumen}
            </p>
            <dl className="mt-2.5 space-y-1 border-t border-white/10 pt-2.5 text-[13px] leading-snug">
              <div className="flex gap-2">
                <dt className="shrink-0 text-white/40">Online platform:</dt>
                <dd className="text-white/60">{row.platform}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-white/40">Alone:</dt>
                <dd className="text-white/60">{row.alone}</dd>
              </div>
            </dl>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function Tick() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
    >
      <circle cx="10" cy="10" r="9" fill="#E31E24" />
      <path
        d="M6 10.2l2.6 2.6L14 7.4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
