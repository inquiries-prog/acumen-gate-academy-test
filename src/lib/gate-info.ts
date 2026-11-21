/**
 * Reference facts about the GATE exam, shown on /courses and every GATE
 * course page.
 *
 * Kept as code constants rather than admin content because they describe the
 * exam itself, not Acumen, and change only when the organising IITs change the
 * exam. They reflect GATE as run in recent cycles (checked Nov 2026); review
 * them against each year's official information brochure. The one date that
 * changes every year - the exam date for the countdown - IS admin-editable,
 * in site settings.
 */

/** How the 100 marks split, for the exam-pattern chart. */
export const GATE_MARKS_SPLIT = [
  { label: "Core subject", marks: 72, tone: "red" as const },
  { label: "General Aptitude", marks: 15, tone: "charcoal" as const },
  { label: "Engineering Mathematics", marks: 13, tone: "muted" as const },
];

export const GATE_PATTERN_FACTS = [
  { value: "3 hrs", label: "Computer-based test" },
  { value: "65", label: "Questions" },
  { value: "100", label: "Total marks" },
  { value: "3 yrs", label: "Score validity" },
];

export const GATE_QUESTION_TYPES = [
  {
    code: "MCQ",
    name: "Multiple choice",
    detail: "One correct option out of four.",
    negative: "−1/3 for a wrong 1-mark answer, −2/3 for a 2-mark answer",
  },
  {
    code: "MSQ",
    name: "Multiple select",
    detail: "One or more of the four options are correct, and all must be chosen.",
    negative: "No negative marking",
  },
  {
    code: "NAT",
    name: "Numerical answer",
    detail: "Type the answer using the on-screen keypad. No options.",
    negative: "No negative marking",
  },
];

/** A typical GATE year. Months, not dates - the dates change every year. */
export const GATE_TIMELINE = [
  { when: "Late August", what: "Registration opens", detail: "Apply on the GATE online portal (GOAPS)." },
  { when: "October", what: "Registration closes", detail: "Late-fee window follows the regular deadline." },
  { when: "Early January", what: "Admit cards", detail: "Downloaded from the portal." },
  { when: "February", what: "Exam days", detail: "Usually the first two weekends of the month." },
  { when: "March", what: "Results & scorecards", detail: "Score valid for three years." },
  { when: "April – July", what: "Admissions & PSU hiring", detail: "COAP/CCMT counselling and PSU recruitment drives." },
];

export const GATE_CAREER_PATHS = [
  {
    icon: "cap" as const,
    title: "M.Tech at IITs, IISc & NITs",
    body: "A good GATE score is the main route into postgraduate engineering at India's top institutes, with a monthly stipend for eligible candidates.",
  },
  {
    icon: "building" as const,
    title: "PSU jobs",
    body: "Public sector undertakings - companies like IOCL, NTPC, BHEL, ONGC and POWERGRID have recruited engineers on the basis of GATE scores. Check each year's notification.",
  },
  {
    icon: "flask" as const,
    title: "Research & PhD",
    body: "GATE qualifies you for direct PhD programmes and research fellowships at IITs, IISc and national laboratories.",
  },
  {
    icon: "shield" as const,
    title: "Government scientific posts",
    body: "Bodies such as the Central Pollution Control Board use GATE percentiles to shortlist for scientist and engineer roles.",
  },
];

export const GATE_ELIGIBILITY = [
  "3rd year or higher of an undergraduate degree, or already graduated",
  "No age limit and no limit on attempts",
  "Up to two papers from the permitted combinations",
];
