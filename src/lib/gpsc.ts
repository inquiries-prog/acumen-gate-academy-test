/**
 * Reference content for the GPSC course page: what GPSC is, its post classes,
 * eligibility, the exam patterns and links to the official syllabus PDFs.
 *
 * Sources (November 2026):
 *  - gpsc.gujarat.gov.in syllabus page and PDFs: Advt 01/2026-27 (Gujarat
 *    Engineering Service (Civil) Class-1 & 2, prelims and mains) and
 *    Advt 24/2026-27 (Assistant Engineer (Civil) Class-2, Roads & Buildings).
 *  - Acumen's "GPSC & GPSC Civil Guide" (updated 24 Nov 2026): classes,
 *    eligibility, pay levels, the CCE pattern and the GES marking scheme.
 *
 * This is fixed reference text, kept in code rather than the database. The
 * course's own text (tagline, overview, highlights, syllabus) is edited in
 * admin as usual. When GPSC changes a pattern, update this file.
 */

export const GPSC_SITE = "https://gpsc.gujarat.gov.in";
export const GPSC_OJAS = "https://gpsc-ojas.gujarat.gov.in";
export const GPSC_SYLLABUS_PAGE = "https://gpsc.gujarat.gov.in/StageDocument?name=syllabus";

const DOC = "https://gpsc.gujarat.gov.in/Documents/AdvertismentDocument/";

/** Official syllabus PDFs, newest notices first. */
export const GPSC_OFFICIAL_DOCS: Array<{ title: string; detail: string; url: string }> = [
  {
    title: "Gujarat Engineering Service (Civil), Class-1 & 2 - Prelims",
    detail: "Advt 01/2026-27",
    url: `${DOC}SYP-1-202627.pdf`,
  },
  {
    title: "Gujarat Engineering Service (Civil), Class-1 & 2 - Mains",
    detail: "Advt 01/2026-27",
    url: `${DOC}SY-1-202627.pdf`,
  },
  {
    title: "Assistant Engineer (Civil), Class-2 - Roads & Buildings",
    detail: "Advt 24/2026-27",
    url: `${DOC}SY-24-202627.pdf`,
  },
  {
    title: "Assistant Engineer (Mechanical), Class-2 - GMB",
    detail: "Advt 30/2026-27",
    url: `${DOC}SY-30-202627.pdf`,
  },
  {
    title: "Assistant Engineer (Electrical), Class-2 - GMB",
    detail: "Advt 138/2025-26",
    url: `${DOC}SY-_138-202526.pdf`,
  },
  {
    title: "General Class 1-2 (GAS / GCS) - Prelims",
    detail: "Advt 05/2026-27",
    url: `${DOC}SYP-5-202627.pdf`,
  },
];

export const GPSC_ABOUT = {
  heading: "What is GPSC?",
  body: [
    "The Gujarat Public Service Commission (GPSC) is the state's constitutional recruitment body. It runs the exams and selection for Gujarat Government services and posts, and publishes every advertisement, syllabus, answer key, result and cut-off. Applications go through the GPSC-OJAS portal.",
    "For an engineer, GPSC is the way into a permanent state engineering post: designing, building and running Gujarat's roads, bridges, dams, water supply, ports and cities. The 2026-27 Gujarat Engineering Service (Civil) notice alone had 103 posts.",
    "One thing to know first: GPSC is the commission, and Class 1, 2 and 3 are levels of service - not one single exam. Engineering posts have their own technical recruitment, separate from the general Class 1-2 exam.",
  ],
  facts: [
    { k: "What it is", v: "Gujarat's recruitment commission" },
    { k: "Stages", v: "Prelims → Mains → Interview" },
    { k: "Prelims", v: "Screening only" },
    { k: "Negative marking", v: "0.3 per wrong answer" },
  ],
};

/** Eligibility for the engineering service, as in Advt 01/2026-27. */
export const GPSC_ELIGIBILITY: Array<{ k: string; v: string }> = [
  { k: "Degree", v: "BE / BTech in the branch of the post (Civil for GES Civil)" },
  { k: "Age", v: "20 to 35 years in the 2026-27 notices, with relaxations for eligible categories" },
  { k: "Also needed", v: "Basic computer knowledge and adequate Gujarati or Hindi" },
  { k: "Final year?", v: "You may sit the prelims; the degree must be in hand before the mains" },
];

/** Departments that recruited engineers through recent GPSC notices. */
export const GPSC_DEPARTMENTS = [
  "Roads & Buildings",
  "Narmada & Water Resources",
  "Water Supply & Kalpsar",
  "Gujarat Water Supply & Sewerage Board",
  "Gujarat Maritime Board",
  "Municipal Corporations",
  "Gujarat Housing Board",
  "Sports Authority of Gujarat",
];

export const GPSC_CLASSES: Array<{
  name: string;
  tag: string;
  summary: string;
  engineering: string[];
  other: string[];
  pay?: string;
}> = [
  {
    name: "Class 1",
    tag: "Senior leadership",
    summary: "Senior state-level posts: leading divisions and departments, large teams and budgets.",
    engineering: ["Executive Engineer (Civil)", "Additional City Engineer (Civil)"],
    other: ["Gujarat Administrative Service", "Deputy Superintendent of Police"],
    pay: "Level 11 · ₹67,700 - ₹2,08,700",
  },
  {
    name: "Class 2",
    tag: "Where most engineers start",
    summary: "Middle management and technical execution: running works, estimates, site inspections and quality control.",
    engineering: ["Deputy Executive Engineer (Civil / Mech / Elec)", "Assistant Engineer (Civil / Mech / Elec)"],
    other: ["Municipal Chief Officer", "Government Labour Officer"],
    pay: "Level 9 · ₹53,100 - ₹1,67,800",
  },
  {
    name: "Class 3",
    tag: "Operational posts",
    summary: "Operational and field roles. Not one exam: the recruiting body, eligibility and pattern depend on the post.",
    engineering: ["Technical posts as notified (diploma or degree)"],
    other: ["State Tax Inspector", "Deputy Section Officer / Deputy Mamlatdar"],
  },
];

export interface GpscPaper {
  name: string;
  marks: string;
  detail: string;
}

export interface GpscStage {
  stage: string;
  kind: string;
  papers: GpscPaper[];
}

export interface GpscTrack {
  key: string;
  label: string;
  short: string;
  sub: string;
  /** How the final merit list is made. */
  merit: string;
  source: string;
  stages: GpscStage[];
}

/** The patterns an engineer is likely to meet. */
export const GPSC_TRACKS: GpscTrack[] = [
  {
    key: "ges",
    label: "Gujarat Engineering Service (Civil): Executive Engineer, Class 1 & Deputy Executive Engineer, Class 2",
    short: "GES Civil",
    sub: "Class 1 & 2",
    merit: "Final merit = Mains (800) + Interview (100) = 900 marks",
    source: "As in Advt 01/2026-27.",
    stages: [
      {
        stage: "Prelims",
        kind: "Objective · screening only, 500 marks",
        papers: [
          { name: "Paper I · General Studies + Engineering Aptitude", marks: "200", detail: "100 + 100 marks, 2 hours. General studies in English or Gujarati, engineering aptitude in English." },
          { name: "Paper II · Civil Engineering", marks: "300", detail: "300 objective questions, 3 hours." },
        ],
      },
      {
        stage: "Mains",
        kind: "Descriptive · 800 marks",
        papers: [
          { name: "Paper I · Gujarati", marks: "100", detail: "2 hours. Essay, letter, report, translation and a grammar section." },
          { name: "Paper II · English", marks: "100", detail: "2 hours. Essay, precis, comprehension, letter, report and grammar." },
          { name: "Papers III, IV, V · Civil Engineering I, II, III", marks: "200 each", detail: "3 hours each: 11 questions of 10 marks and 6 of 15 marks." },
        ],
      },
      {
        stage: "Interview",
        kind: "Personality test",
        papers: [{ name: "Interview", marks: "100", detail: "For candidates who qualify in the mains." }],
      },
    ],
  },
  {
    key: "ae",
    label: "Assistant Engineer / Deputy Executive Engineer, Class 2 (department notices)",
    short: "AE / DyEE",
    sub: "Class 2 posts",
    merit: "Selection as per the advertisement for the post",
    source: "As in Advt 24/2026-27, Assistant Engineer (Civil), Class-2, Roads & Buildings.",
    stages: [
      {
        stage: "Preliminary test",
        kind: "Objective (OMR) · 300 marks",
        papers: [
          { name: "Part 1 · General Studies", marks: "100", detail: "History, polity, economy, geography, science, reasoning and current affairs. Gujarati medium." },
          { name: "Part 2 · Technical (your branch)", marks: "200", detail: "200 questions from the core subjects of your branch. English medium." },
        ],
      },
      {
        stage: "Interview",
        kind: "Personality test",
        papers: [{ name: "Interview", marks: "-", detail: "For candidates shortlisted on the preliminary test, as per the advertisement." }],
      },
    ],
  },
  {
    key: "cce",
    label: "General Class 1-2 Combined Competitive Exam (GAS, GCS, Municipal Chief Officer)",
    short: "Class 1-2 CCE",
    sub: "Administrative",
    merit: "Final merit = Essay + GS I-IV (1,250) + Interview (150) = 1,400 marks",
    source: "Revised scheme under the 2025 rules, as in Advt 05/2026-27.",
    stages: [
      {
        stage: "Prelims",
        kind: "Objective · screening only",
        papers: [{ name: "General Studies", marks: "200", detail: "Gujarat and India history, geography, polity, economy, science, environment and current affairs." }],
      },
      {
        stage: "Mains",
        kind: "7 descriptive papers",
        papers: [
          { name: "Gujarati and English", marks: "300 each", detail: "Qualifying only: at least 25% in each." },
          { name: "Essay + General Studies I, II, III, IV", marks: "250 each", detail: "1,250 merit marks. GS IV is ethics, integrity and aptitude." },
        ],
      },
      {
        stage: "Interview",
        kind: "Personality test",
        papers: [{ name: "Interview", marks: "150", detail: "For candidates shortlisted on the mains." }],
      },
    ],
  },
];

/** How Acumen's GPSC classes are organised. */
export const GPSC_PROGRAM: Array<{ step: string; title: string; body: string }> = [
  {
    step: "01",
    title: "General studies, Gujarat first",
    body: "History, culture, polity, economy and geography of India and Gujarat, plus science, reasoning and current affairs - in English and Gujarati.",
  },
  {
    step: "02",
    title: "Technical paper by branch",
    body: "Every line of the official syllabus mapped to a standard reference, taught by our GATE faculty, with the IS codes and design assumptions it lists.",
  },
  {
    step: "03",
    title: "Objective and descriptive practice",
    body: "Timed OMR mocks with 0.3 negative marking for the prelims, and step-by-step answer writing for the descriptive mains, Gujarati and English included.",
  },
  {
    step: "04",
    title: "Interview guidance",
    body: "Once you clear the written stage: mock interviews, your branch's current projects in Gujarat and how to talk about them.",
  },
];

export const GPSC_FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Who can apply for GPSC engineering posts?",
    a: "For the Gujarat Engineering Service (Civil) 2026-27 notice: a BE or BTech in Civil Engineering, age 20 to 35 (with relaxations for eligible categories), basic computer knowledge and adequate Gujarati or Hindi. Final-year students may sit the prelims if they have the degree before the mains. Each advertisement sets its own rules, so check the one for your post.",
  },
  {
    q: "What do Class 1, Class 2 and Class 3 mean?",
    a: "They are levels of state service, not separate exams. Class 1 is senior leadership (for example Executive Engineer), Class 2 is middle management and technical execution, where most engineers start (Deputy Executive Engineer, Assistant Engineer), and Class 3 covers operational posts, whose recruiting body and pattern depend on the post.",
  },
  {
    q: "Is the GPSC engineering exam the same as the general Class 1-2 exam?",
    a: "No. The Gujarat Engineering Service is a separate technical recruitment for engineering graduates, with its own civil engineering papers. The general Class 1-2 Combined Competitive Exam is for administrative services such as GAS.",
  },
  {
    q: "Do prelims marks count in the final merit?",
    a: "No. For both the Gujarat Engineering Service and the general Class 1-2 exam, the prelims only screen candidates for the mains. For GES Civil, the final merit is mains (800) plus interview (100).",
  },
  {
    q: "Is there negative marking?",
    a: "Yes, in the objective (OMR) sections: 0.3 mark is deducted for each wrong answer, as stated in the GPSC syllabus.",
  },
  {
    q: "What is the GPSC cut-off?",
    a: "There is no single cut-off. It depends on the advertisement, post, stage, category and reservation rules, and a prelims cut-off is different from the final one. Use the official cut-off notice for your exact advertisement, published in GPSC's results section.",
  },
  {
    q: "Can I prepare for GATE and GPSC together?",
    a: "Yes, and it is a common plan. The technical syllabus overlaps heavily with GATE, so the extra work is general studies, Gujarati and English, and the descriptive answer writing of the mains - which is what this course adds.",
  },
];
