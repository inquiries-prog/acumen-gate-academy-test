/**
 * Seed / fallback content.
 *
 * Two jobs:
 *  1. The site renders correctly before Supabase is connected, so the client
 *     can review it immediately.
 *  2. `supabase/seed.sql` is generated from these same values, so the database
 *     starts out matching the SRS instead of empty.
 *
 * All copy here is transcribed from the SRS. Where the SRS does NOT supply
 * real content (student testimonials, result entries, per-university offers,
 * fees), the value is a clearly-marked placeholder rather than an invention -
 * see docs/PENDING.md.
 */

import type {
  AboutBlock,
  Batch,
  Branch,
  Center,
  Course,
  CourseCard,
  CourseSubject,
  EcosystemCard,
  Faq,
  FaqCategory,
  FormOption,
  GalleryImage,
  LegalPage,
  Mentor,
  NewsPost,
  PageSeo,
  PedagogyPoint,
  ResultEntry,
  ResultYear,
  SiteSettings,
  Testimonial,
  University,
  WhyChooseCard,
} from "./types";

/** Marker used by the admin panel to highlight content that still needs real data. */
export const PLACEHOLDER = "__PLACEHOLDER__";

// --- SRS 6.1 / 6.3: NAP must be byte-identical everywhere (SRS 13). --------
export const PHONE_DISPLAY = "098793 87738";
export const PHONE_TEL = "+919879387738";
export const HEAD_OFFICE_ADDRESS =
  "201, Siddhivinayak Complex, Ellora Park Rd, next to Bank of India, Subhanpura, Vadodara, Gujarat 390023";

// The single placeholder demo video the client supplied (SRS 7.1.6).
export const DEMO_VIDEO_ID = "2nh8TYHqa8s";
export const DEMO_VIDEO_START = 824;

/**
 * WhatsApp contact. A code constant on purpose, like PHONE_DISPLAY: adding it
 * to `siteSettings` would be spread into the `site_settings` insert by the
 * seeder, and an unknown column would break a fresh seed. Making it
 * admin-editable later is one migration plus a field on the settings form.
 */
export const WHATSAPP_NUMBER = "8200035090";
export const WHATSAPP_DISPLAY = "+91 82000 35090";
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Acumen Gate Academy, I'd like to know more about your GATE coaching batches.";

export const siteSettings: SiteSettings = {
  // SRS 6.2
  banner_enabled: true,
  banner_text: "🎓 Have you attended our Seminar? Know the exclusive offer waiting for you",
  banner_link_label: "Know more",
  banner_link_action: "seminar",
  banner_link_url: "",
  // SRS 7.1.1 - headline sits above tagline, and the two must not repeat a claim.
  hero_headline: "Every GATE Rank tells a story. Start writing yours.",
  hero_tagline: "Gujarat's most trusted name in GATE coaching since 2014",
  hero_primary_cta: "Enquire now",
  hero_secondary_cta: "Explore courses",
  // SRS 7.1.3 - the ONLY headline number used anywhere on this site.
  stat_line: "10,000+ GATE Success Stories and Counting.",
  phone: PHONE_DISPLAY,
  email: "inquiries@acumenhr.in",
  footer_tagline: "Gujarat's most trusted name in GATE coaching, since 2014.",
  instagram_url: "",
  youtube_url: "",
  facebook_url: "",
  google_rating: "5.0",
  google_reviews_count: "163",
  google_reviews_url: "",
  // Client-supplied logo. Used as-is in the header and on a white chip in the
  // footer - never recoloured or inverted via CSS filters (SRS 3.2).
  logo_url: "/assets/logo/acumen-gate-academy-logo.png",
  // Still pending (SRS 12): these are the Acumen 360 and Etude 360 marks for
  // the footer ecosystem badges, which are different logos from the one above.
  acumen360_logo_url: "",
  etude360_logo_url: "",
  final_cta_heading: "Ready to start your GATE journey?",
  final_cta_button: "Talk to us",
  // SAMPLE (Nov 2026): the official GATE 2027 dates are announced by the
  // organising IIT. GATE is usually held on the first weekends of February.
  // Editable in admin -> Banner, hero & contact details.
  gate_exam_label: "GATE 2027",
  gate_exam_date: "2027-02-06",
  demo_heading: "Sit in on a free GATE demo class",
  demo_subtext:
    "A real live lecture with an Acumen mentor, a doubt-clearing slot, and a study plan for your branch. No fee, no obligation.",
  demo_nudge_enabled: true,
  demo_nudge_seconds: "25",
};

// --- SRS 7.1.4 -------------------------------------------------------------
export const courseCards: CourseCard[] = [
  {
    id: "course-classroom",
    title: "Classroom Courses",
    banner_label: "Offline at Vadodara",
    description:
      "Offline GATE coaching at our Vadodara centre, with small batches, a dedicated library, and mentors who know every student personally.",
    image_url: "",
    alt_text: "Students in an Acumen Gate Academy classroom in Vadodara",
    action: "batches_offline",
    button_label: "Explore classroom courses",
    visible: true,
    sort_order: 1,
  },
  {
    id: "course-online",
    title: "Online Courses",
    banner_label: "Live online batches",
    description:
      "Live online GATE batches built to carry the same structure and mentor access as our classroom programme, not recorded videos alone.",
    image_url: "",
    alt_text: "Acumen Gate Academy live online GATE batch",
    action: "batches_online",
    button_label: "Explore online courses",
    visible: true,
    sort_order: 2,
  },
  {
    id: "course-gpsc",
    title: "GPSC Coaching",
    banner_label: "For engineering roles",
    description:
      "Dedicated GPSC coaching for engineering roles - covering GPSC Class 1, Class 2 and Class 3 exams, for students and professionals preparing for Gujarat state government engineering services.",
    image_url: "",
    alt_text: "Acumen Gate Academy GPSC coaching for engineering roles",
    action: "enquiry",
    button_label: "Enquire about GPSC coaching",
    visible: true,
    sort_order: 3,
  },
];

// --- SRS 7.1.6: all six branches ------------------------------------------
export const branches: Branch[] = [
  { id: "br-me", code: "ME", name: "Mechanical Engineering", visible: true, sort_order: 1 },
  { id: "br-ce", code: "CE", name: "Civil Engineering", visible: true, sort_order: 2 },
  { id: "br-cse", code: "CSE", name: "Computer Science Engineering", visible: true, sort_order: 3 },
  { id: "br-ee", code: "EE", name: "Electrical Engineering", visible: true, sort_order: 4 },
  { id: "br-ec", code: "EC", name: "Electronics & Communication", visible: true, sort_order: 5 },
  { id: "br-ch", code: "CH", name: "Chemical Engineering", visible: true, sort_order: 6 },
];

/**
 * Batches. A branch can run several per mode - here, offline weekday and
 * weekend batches and one live online batch for each branch.
 *
 * Fees are the client's real figures (Nov 2026), GST-inclusive: Rs 15,000
 * online, Rs 45,000 offline. Titles, start dates, schedules, durations and
 * languages are SAMPLE DATA for the course pages (Nov 2026) and must be
 * replaced with the client's real details before launch - see PENDING A4.
 * Every field is admin-editable; nothing here is referenced by code.
 */
const SAMPLE_BATCHES: Array<
  Pick<Batch, "mode" | "title" | "start_date" | "schedule" | "duration" | "medium" | "badge"> & {
    key: string;
    fees: number;
    seats: string;
  }
> = [
  {
    key: "offline-weekday",
    mode: "offline",
    title: "Weekday Regular Batch · Vadodara",
    start_date: "4 January 2027",
    schedule: "Mon–Fri · 5:30–8:30 PM",
    duration: "12 months",
    medium: "English + Hindi",
    badge: "New",
    fees: 45000,
    seats: "40",
  },
  {
    key: "offline-weekend",
    mode: "offline",
    title: "Weekend Batch · Vadodara",
    start_date: "9 January 2027",
    schedule: "Sat & Sun · 9:30 AM–4:30 PM",
    duration: "14 months",
    medium: "English + Hindi",
    badge: "",
    fees: 45000,
    seats: "40",
  },
  {
    key: "online",
    mode: "online",
    title: "Live Online Batch",
    start_date: "11 January 2027",
    schedule: "Mon–Sat · 7:00–9:00 PM, live + recordings",
    duration: "12 months",
    medium: "English + Hindi",
    badge: "",
    fees: 15000,
    seats: "",
  },
];

export const batches: Batch[] = branches.flatMap((b, i) =>
  SAMPLE_BATCHES.map((sample, j) => ({
    id: `batch-${b.code.toLowerCase()}-${sample.key}`,
    branch_id: b.id,
    mode: sample.mode,
    title: sample.title,
    start_date: sample.start_date,
    schedule: sample.schedule,
    duration: sample.duration,
    medium: sample.medium,
    badge: sample.badge,
    faculty: PLACEHOLDER,
    fees: sample.fees,
    fees_note: "",
    seats: sample.seats,
    video_id: DEMO_VIDEO_ID,
    video_start: DEMO_VIDEO_START,
    enroll_enabled: true,
    visible: true,
    sort_order: i * 10 + j + 1,
  })),
);

// --- SRS 7.1.6 / 7.2.4: the 9-point pedagogy checklist ---------------------
export const pedagogyPoints: PedagogyPoint[] = [
  "450+ hours of offline teaching",
  "App access for live and recorded lectures",
  "Weekly assignments & tests",
  "National level test series",
  "Books in soft copy on the app",
  "Mentoring sessions",
  "Post-GATE guidance",
  "Admission support",
  "Placement assistance",
].map((text, i) => ({ id: `ped-${i + 1}`, text, sort_order: i + 1 }));

// --- SRS 7.1.5: six cards, equal visual weight -----------------------------
export const whyChooseCards: WhyChooseCard[] = [
  {
    id: "why-1",
    heading: "Proven results across Gujarat",
    body: "Thousands of students have built their careers through PSUs, IITs, and IISc with Acumen's guidance since 2014.",
    sort_order: 1,
  },
  {
    id: "why-2",
    heading: "Mentors who know you personally",
    body: "Small batch sizes mean real relationships - your mentors know your strengths and weak points, and stay with you through both.",
    sort_order: 2,
  },
  {
    id: "why-3",
    heading: "Always reachable, even online",
    body: "Based right here in Vadodara - even online batch students can call, walk in, or reach out directly. Real people, not a ticket queue.",
    sort_order: 3,
  },
  {
    id: "why-4",
    heading: "We work around your university",
    body: "Class schedules adjust around your college exams - end-sems, internals - so GATE prep never competes with your degree.",
    sort_order: 4,
  },
  {
    id: "why-5",
    heading: "Comfortable classrooms with library",
    body: "A proper study environment - comfortable classrooms and a dedicated library facility, not just a rented room.",
    sort_order: 5,
  },
  {
    id: "why-6",
    heading: "Real placement support",
    body: "80%+ attendance and 80%+ assignment/test completion gets you placement support through Acumen 360 HR Consultancy, running since 2008.",
    sort_order: 6,
  },
];

// --- SRS 7.1.9: six real faculty, bios transcribed from the SRS ------------
export const mentors: Mentor[] = [
  {
    id: "mentor-1",
    name: "Dr. Umashankar Tripathi",
    title: "Lead Mentor",
    bio: "PhD & MTech from IIT Roorkee, 13+ years teaching, multiple GATE qualifications, 3 SCI research papers, 76.02 marks in GATE.",
    image_url: "",
    alt_text: "Dr. Umashankar Tripathi, Lead Mentor at Acumen Gate Academy",
    visible: true,
    sort_order: 1,
  },
  {
    id: "mentor-2",
    name: "Er. Mukesh Rai",
    title: "Lead Mentor",
    bio: "ME in Structural Engineering, 10 years teaching, 3-time Best Faculty Award recipient, author of 28+ books on GATE/GPSC.",
    image_url: "",
    alt_text: "Er. Mukesh Rai, Lead Mentor at Acumen Gate Academy",
    visible: true,
    sort_order: 2,
  },
  {
    id: "mentor-3",
    name: "Er. Mrunal Shah",
    title: "Lead Mentor",
    bio: "Multiple times under-500 GATE rank, 8+ years teaching, cleared ISRO and BARC exams, created 500+ GATE rankers.",
    image_url: "",
    alt_text: "Er. Mrunal Shah, Lead Mentor at Acumen Gate Academy",
    visible: true,
    sort_order: 3,
  },
  {
    id: "mentor-4",
    name: "Er. Surbhi Jain",
    title: "Lead Mentor",
    bio: "Masters in Engineering, 7 years teaching, authored foundation books of Civil Engineering.",
    image_url: "",
    alt_text: "Er. Surbhi Jain, Lead Mentor at Acumen Gate Academy",
    visible: true,
    sort_order: 4,
  },
  {
    id: "mentor-5",
    name: "Er. Ashish Katare",
    title: "Lead Mentor",
    bio: "11 years teaching in national institutes, ex-government officer (MP IT Department), recognized as one of the best GATE faculty for CS.",
    image_url: "",
    alt_text: "Er. Ashish Katare, Lead Mentor at Acumen Gate Academy",
    visible: true,
    sort_order: 5,
  },
  {
    id: "mentor-6",
    name: "Er. Shefali Singhla",
    title: "Lead Mentor",
    bio: "Masters in Computer Science from Canada, 12 years teaching, renowned CS faculty in India.",
    image_url: "",
    alt_text: "Er. Shefali Singhla, Lead Mentor at Acumen Gate Academy",
    visible: true,
    sort_order: 6,
  },
];

export const MENTORS_INTRO = "We bring the best GATE faculties from India to Gujarat";
export const MENTORS_CREDIBILITY =
  "Every mentor at Acumen is a GATE top ranker, a PSU professional, or a government officer - and many are multiple-time GATE qualifiers.";

/**
 * SRS 7.1.7 lists the universities these cards are drawn from, but supplies no
 * actual student names, quotes or photos. Real testimonials are not invented
 * here - these are empty scaffolds the client fills in through the admin panel.
 */
export const testimonials: Testimonial[] = [
  "MSU Baroda",
  "Parul University",
  "Charusat University",
  "BVM Vallabh Vidyanagar",
  "DDU Nadiad",
  "Navrachana University",
].map((university, i) => ({
  id: `testimonial-${i + 1}`,
  scope: "home" as const,
  media_type: "photo" as const,
  image_url: "",
  alt_text: "",
  video_id: "",
  student_name: PLACEHOLDER,
  university,
  rank_branch: PLACEHOLDER,
  quote: PLACEHOLDER,
  visible: true,
  sort_order: i + 1,
}));

// --- SRS 7.4: years are data, and can be added forever --------------------
export const resultYears: ResultYear[] = [
  { id: "year-2026", label: "GATE 2026", year: 2026, visible: true, sort_order: 1 },
  { id: "year-2025", label: "GATE 2025", year: 2025, visible: true, sort_order: 2 },
  { id: "year-2024", label: "GATE 2024", year: 2024, visible: true, sort_order: 3 },
];

/** No result entries are seeded - real student names and AIRs come from the client. */
export const resultEntries: ResultEntry[] = [];

// --- SRS 7.3: the CPCB seed post, written from the facts given in the SRS --
export const newsPosts: NewsPost[] = [
  {
    id: "news-cpcb",
    slug: "cpcb-recruitment-gate-score-requirement",
    title: "CPCB Recruitment: Scientist-B and Scientific Assistant roles require a valid GATE score",
    excerpt:
      "The Central Pollution Control Board's recruitment for Scientist-B and Scientific Assistant positions requires a valid GATE score at the 90th percentile - here is what that means for your preparation.",
    content: [
      "The Central Pollution Control Board (CPCB) recruits for Scientist-B and Scientific Assistant positions, and both roles require candidates to hold a valid GATE score at the 90th percentile.",
      "",
      "This is worth understanding clearly, because it changes how you should think about your GATE attempt. A 90th percentile requirement is not about clearing GATE - it is about where you place among everyone who wrote the paper that year. Two candidates can both 'qualify' GATE and only one of them is eligible for these roles.",
      "",
      "It is also a good illustration of a wider pattern. GATE is not only an admissions exam for M.Tech programmes at the IITs and IISc; it is the screening filter used across a large number of public sector and government scientific roles. A single well-prepared attempt can open both routes at once, which is why we encourage students to treat their GATE score as a career asset rather than a one-time admission ticket.",
      "",
      "If you are preparing for GATE with public sector roles in mind, plan for a percentile target, not just a qualifying mark - and check each notification carefully, because the exact percentile and the eligible branches vary between organisations and between recruitment cycles.",
      "",
      "Acumen students receive updates on notifications like this as part of our post-GATE guidance.",
    ].join("\n"),
    published_at: "2025-08-01",
    published: true,
  },
];

// --- SRS 7.2: About Us copy ------------------------------------------------
export const aboutBlocks: AboutBlock[] = [
  {
    key: "opening",
    heading: "About Acumen Gate Academy",
    body: "Acumen Gate Academy is one of Gujarat's most trusted GATE coaching institutes, headquartered in Vadodara since 2014, with a weekend center in Vidyanagar. Founded by Rohit Chandorkar, Acumen has guided over 10,000 GATE success stories across Gujarat, through offline coaching and live online batches covering Mechanical, Civil, Computer Science, Electrical, Electronics & Communication, and Chemical Engineering, along with GPSC coaching. Our faculty are drawn from IITs, GATE toppers, PSUs, and government officials, bringing verified, real-world expertise into every classroom.",
  },
  {
    key: "story",
    heading: "Our Story",
    body: "Rohit Chandorkar, a former Baroda Ranji Trophy Champion, transitioned from cricket to entrepreneurship at the age of 24, running a successful manufacturing firm for a decade. Following his passion for learning and development, he founded Acumen 360 - a recruitment and HR consultancy - together with his wife and co-founder Himani Chandorkar, who brought 19 years of experience across manufacturing, services, and entrepreneurship. In 2014, Rohit founded Acumen Gate Academy, extending Acumen's industry-facing approach into GATE coaching, built around preparing students not just to clear an exam, but to build real careers. In 2020, Rohit and Himani launched Etude 360, a leadership training venture incubated at IIM B-NSRCEL - among the top 20 ventures incubated there in 2021. A certified coach and NLP practitioner, Himani has personally trained 400+ managers and holds qualifications in OD Analysis, Transactional Analysis, and Learning Game Design. Today, Acumen Gate Academy sits within this larger ecosystem - students preparing for GATE are connected to the same industrial, HR, and leadership network built across Acumen 360 and Etude 360.",
  },
  {
    key: "different",
    heading: "What Makes Us Different",
    body: [
      "With a presence across Gujarat - from our Vadodara center to seminar partnerships with universities including Charusat, Parul, MSU, BVM, DDU, Navrachana, GECS, and many other Gujarat-based universities - Acumen is built around one core belief: mentors and students should actually know each other. At Acumen, faculty know you personally, and you know them - not as a name on a schedule, but as a mentor who tracks your progress through the highs and the lows.",
      "",
      "That relationship extends beyond the classroom. Acumen's alumni network today spans IITs, IISc, top companies, PSUs, and placements abroad - a living network current students can lean on.",
      "",
      "We also understand GATE preparation doesn't happen in isolation. Every batch schedule is designed around your college's end-semester and mid-semester exams, so GATE prep supports your degree instead of competing with it.",
    ].join("\n"),
  },
];

export const PEDAGOGY_INTRO =
  "Every Acumen batch runs on the same nine-point structure, whether you study with us offline in Vadodara or live online. It is what a student actually receives after enrolling - not a list of aspirations.";

// --- SRS 7.2.3: Acumen Gate Academy is the highlighted lead entity ---------
export const ecosystemCards: EcosystemCard[] = [
  {
    id: "eco-aga",
    name: "Acumen Gate Academy",
    year: "2014",
    description: "GATE & GPSC coaching, offline and online, across six engineering branches.",
    logo_url: "",
    highlighted: true,
    sort_order: 1,
  },
  {
    id: "eco-360",
    name: "Acumen 360",
    year: "2008",
    description:
      "Recruitment & HR consultancy, co-founded by Rohit & Himani Chandorkar - the network behind Acumen's placement support.",
    logo_url: "",
    highlighted: false,
    sort_order: 2,
  },
  {
    id: "eco-etude",
    name: "Etude 360",
    year: "2020",
    description:
      "Leadership training venture incubated at IIM B-NSRCEL - a top 20 incubated venture in 2021.",
    logo_url: "",
    highlighted: false,
    sort_order: 3,
  },
];

// --- SRS 6.3 / 7.2.6: Vidyanagar deliberately has no address --------------
export const centers: Center[] = [
  {
    id: "center-vadodara",
    name: "Vadodara",
    label: "Head Office",
    address: HEAD_OFFICE_ADDRESS,
    show_address: true,
    description: "Our head office and main offline centre, with classrooms and a dedicated library.",
    phone: PHONE_DISPLAY,
    sort_order: 1,
  },
  {
    id: "center-vidyanagar",
    name: "Vidyanagar",
    label: "Weekend Center",
    address: "",
    show_address: false,
    description:
      "Weekend classes for students in the Vallabh Vidyanagar region, run by the same faculty who teach at our Vadodara centre.",
    phone: PHONE_DISPLAY,
    sort_order: 2,
  },
];

// --- FAQ page categories, in display order --------------------------------
export const FAQ_CATEGORIES: Array<{ key: FaqCategory; label: string; blurb: string }> = [
  { key: "gate", label: "The GATE exam", blurb: "Eligibility, pattern, marking and what a score is worth." },
  { key: "courses", label: "Courses & batches", blurb: "Which batch fits you and how the course runs." },
  { key: "demo", label: "Free demo class", blurb: "What happens in a demo and how to book one." },
  { key: "fees", label: "Fees & payment", blurb: "What you pay, GST and paying online." },
  { key: "online", label: "Online classes", blurb: "Live classes, recordings and doubt support." },
  { key: "about", label: "About Acumen", blurb: "Our centres, faculty and placement support." },
];

// --- SRS 7.2.8: ten FAQs, answers transcribed verbatim --------------------
// These ten are the About page set (category "about").
const aboutFaqs = [
  {
    question: "Is Acumen Gate Academy the best GATE coaching in Vadodara?",
    answer:
      "Acumen Gate Academy has been coaching GATE aspirants in Vadodara since 2014, with over 10,000 GATE success stories to date. Our faculty include IIT graduates, GATE toppers, PSU professionals, and government officials, and our students consistently feature in newspaper coverage across Gujarat. Our mentor-student relationships and placement support through Acumen 360 offer something no large, online-only platform can replicate.",
  },
  {
    question: "Does Acumen offer GATE coaching across Gujarat, or only in Vadodara?",
    answer:
      "Acumen Gate Academy is headquartered in Vadodara, with a weekend center also held in Vidyanagar. Beyond our physical centers, we conduct seminars and expert sessions at universities across Gujarat, including Charusat, Parul, MSU, BVM, DDU, Navrachana, GECS, and many other Gujarat-based universities. Our online batches are also open to students anywhere in Gujarat, and beyond.",
  },
  {
    question: "Should I join offline or online GATE coaching?",
    answer:
      "At Acumen, we believe offline coaching consistently delivers better results than online-only learning - especially compared to large national online platforms where you're one of thousands of anonymous learners with no real mentor relationship. In an offline classroom, your mentor knows you personally, tracks your progress, and adjusts to how you actually learn. That said, we understand not everyone can attend in person, which is why our online batches are built to bring as much of that same structure and mentor access as possible, rather than leaving you with recorded videos alone.",
  },
  {
    question: "What branches does Acumen Gate Academy cover for GATE coaching?",
    answer:
      "Acumen offers GATE coaching across six branches: Mechanical Engineering (ME), Civil Engineering (CE), Computer Science Engineering (CSE), Electrical Engineering (EE), Electronics & Communication (EC), and Chemical Engineering (CH), in both offline and online formats.",
  },
  {
    question: "Does Acumen provide placement support after GATE?",
    answer:
      "Yes. Students who maintain 80%+ attendance and complete 80%+ of assignments and tests through their batch become eligible for placement support through Acumen 360, our recruitment and HR consultancy running since 2008. This isn't a generic promise - it's a structured outcome tied to genuine effort during your GATE preparation.",
  },
  {
    question: "Where are Acumen Gate Academy's centers located?",
    answer: `Our head office and main offline center is in Vadodara, at ${HEAD_OFFICE_ADDRESS}. We also hold a weekend center in Vidyanagar for students in that region.`,
  },
  {
    question: "Does Acumen also offer GPSC coaching?",
    answer:
      "Yes. Alongside our core GATE coaching programs, Acumen offers dedicated GPSC coaching for engineering roles - covering GPSC Class 1, Class 2, and Class 3 exams, for students and professionals preparing for Gujarat state government engineering services.",
  },
  {
    question: "Should I start preparing for GATE in 3rd semester, or is 5th semester okay?",
    answer:
      "At Acumen, we recommend starting GATE preparation in 3rd semester. Most of the GATE technical syllabus is spread across your 3rd to 6th semester coursework, so starting early means your GATE preparation and college subjects reinforce each other from the very beginning. Students who start in 3rd semester typically build a strong enough foundation to qualify GATE in their very first attempt, often as early as their third year - rather than facing a rushed, high-pressure attempt in their final year. Starting in 5th semester is still workable, but it usually means a faster, more intensive pace to cover the same ground.",
  },
  {
    question: "What is the best time to start GATE preparation?",
    answer:
      "The best time to start is 3rd semester. Since most GATE-relevant technical subjects are taught between 3rd and 6th semester, an early start lets you absorb these subjects once, for both your college exams and GATE, rather than relearning them later. This timing also gives students a genuinely strong chance of qualifying GATE on their first attempt, without waiting until final year when time and pressure are both working against you.",
  },
  {
    question: "How do I manage GATE preparation alongside college studies?",
    answer:
      "This is exactly why Acumen designs its batch schedules around your college's academic calendar - including end-semester and mid-semester exam periods - so GATE classes never directly conflict with your college exams. We also recommend students treat GATE-relevant college subjects as dual-purpose study time, rather than two separate efforts. Our mentors work with students individually to adjust pacing during heavier college exam periods, so preparation continues without falling behind.",
  },
];

/**
 * SAMPLE FAQs for the /faq page (Nov 2026). GATE facts reflect the exam as run
 * in recent cycles; the organising IIT can change details each year, so these
 * should be checked against the GATE 2027 information brochure. Answers about
 * Acumen's own process are written as safe defaults and should be confirmed by
 * the client - see PENDING.
 */
const sampleFaqs: Array<{ category: FaqCategory; question: string; answer: string }> = [
  // The GATE exam
  {
    category: "gate",
    question: "What is GATE?",
    answer:
      "GATE (Graduate Aptitude Test in Engineering) is a national computer-based exam conducted jointly by IISc Bengaluru and seven IITs on rotation. A GATE score is used for M.Tech and PhD admissions at the IITs, IISc and NITs, for recruitment by many public sector undertakings (PSUs), and for several government scientific and engineering posts.",
  },
  {
    category: "gate",
    question: "Who is eligible to write GATE?",
    answer:
      "Students in the third or higher year of an undergraduate degree in engineering, technology, architecture, science, commerce or arts, and anyone who has already completed such a degree, can apply. There is no age limit and no limit on the number of attempts.",
  },
  {
    category: "gate",
    question: "What is the GATE exam pattern?",
    answer:
      "GATE is a 3-hour computer-based test with 65 questions worth 100 marks. General Aptitude carries 15 marks (10 questions). The remaining 85 marks cover the subject paper, of which engineering mathematics is usually about 13 marks. Questions are multiple choice (MCQ), multiple select (MSQ) or numerical answer type (NAT).",
  },
  {
    category: "gate",
    question: "Is there negative marking in GATE?",
    answer:
      "Only for multiple choice questions: a wrong answer loses 1/3 of a mark on a 1-mark question and 2/3 of a mark on a 2-mark question. Multiple select and numerical answer questions carry no negative marking.",
  },
  {
    category: "gate",
    question: "How long is a GATE score valid?",
    answer:
      "A GATE score is valid for three years from the date the results are announced. PSUs usually accept only the score from a specific recent year, so always check each recruitment notification.",
  },
  {
    category: "gate",
    question: "When is GATE held?",
    answer:
      "GATE is normally held over the first two weekends of February, with registration opening around late August and results announced in March. The exact dates for each year are announced by the organising institute.",
  },
  {
    category: "gate",
    question: "Can I write two GATE papers?",
    answer:
      "Yes. Candidates can appear in up to two papers, chosen from the combinations the organising institute allows that year.",
  },
  // Courses & batches
  {
    category: "courses",
    question: "Which batch should I join: weekday, weekend or online?",
    answer:
      "Weekday batches suit students who live in or near Vadodara and can attend in the evening. Weekend batches suit students whose college timetable fills the week. Live online batches suit students outside Vadodara or anyone who needs flexibility. Every batch follows the same nine-point structure, and our counsellors will help you choose. Book a free demo class or call us.",
  },
  {
    category: "courses",
    question: "How long is a GATE course?",
    answer:
      "Our full GATE courses run for about 12 months, covering the complete syllabus for your branch, followed by revision, a national-level test series and post-GATE guidance. The exact duration of each batch is shown on its course page.",
  },
  {
    category: "courses",
    question: "Will classes clash with my college exams?",
    answer:
      "No. Every Acumen batch schedule is planned around university end-semester and mid-semester exams, so your GATE preparation supports your degree rather than competing with it.",
  },
  {
    category: "courses",
    question: "Do you provide study material?",
    answer:
      "Yes. Every enrolled student gets books in soft copy on the Acumen app, weekly assignments and tests, and access to our national-level test series.",
  },
  {
    category: "courses",
    question: "Can I switch from an online batch to an offline batch later?",
    answer:
      "Please speak with our team. Where seats are available we will do our best to help you move, and any difference in fee is worked out with you before the switch.",
  },
  // Free demo class
  {
    category: "demo",
    question: "Is the demo class really free?",
    answer:
      "Yes. The demo class costs nothing and there is no obligation to enroll. It is the best way to see how our mentors teach before you decide.",
  },
  {
    category: "demo",
    question: "What happens in a free demo class?",
    answer:
      "You attend a real lecture on a core topic from your branch, taught by an Acumen mentor, followed by a short doubt-clearing slot. Afterwards a counsellor can talk you through a study plan and the batch options that fit your college schedule.",
  },
  {
    category: "demo",
    question: "Can I attend the demo class online?",
    answer:
      "Yes. When you book, you can choose an online demo or attend in person at our Vadodara centre.",
  },
  {
    category: "demo",
    question: "How do I book a free demo class?",
    answer:
      "Tap 'Free Demo Class' anywhere on the website and fill in your name, phone number and branch. Our team will call you to confirm the date and time.",
  },
  // Fees & payment
  {
    category: "fees",
    question: "Does the course fee include GST?",
    answer:
      "Yes. The fee shown on each course page is the full amount you pay, including 18% GST. Your GST invoice shows the base fee and the GST amount separately.",
  },
  {
    category: "fees",
    question: "How can I pay the fee?",
    answer:
      "You can enroll and pay online from any course page using UPI, debit or credit card, or net banking through our secure payment partner. You can also pay at our Vadodara centre.",
  },
  {
    category: "fees",
    question: "Will I get an invoice?",
    answer: "Yes. A GST tax invoice is emailed to you as soon as your online payment is confirmed.",
  },
  {
    category: "fees",
    question: "What if my payment fails?",
    answer:
      "If money left your account but the payment did not complete, your bank normally reverses it automatically. Either way, call us and our team will help you finish enrolling. Your details are saved, so you won't need to start again.",
  },
  // Online classes
  {
    category: "online",
    question: "Are online classes live or recorded?",
    answer:
      "Online batches are taught live, so you can ask questions in class. Every lecture is also recorded on the Acumen app, so you can revise or catch up on a class you missed.",
  },
  {
    category: "online",
    question: "How do online students clear doubts?",
    answer:
      "In the live class itself, in mentoring sessions, and by reaching our team directly. Online students can call, message, or walk in to our Vadodara centre like any classroom student.",
  },
  {
    category: "online",
    question: "Do online students get the same test series?",
    answer:
      "Yes. Online students get the same weekly tests, assignments and national-level test series as classroom students.",
  },
];

export const faqs: Faq[] = [
  ...aboutFaqs.map((f) => ({ ...f, category: "about" as const })),
  ...sampleFaqs,
].map((f, i) => ({ id: `faq-${i + 1}`, ...f, visible: true, sort_order: i + 1 }));

// --- SRS 8.1 / 8.2: every dropdown list is admin-editable data -------------
export const formOptions: FormOption[] = [
  ...branches.map((b, i) => ({
    id: `opt-branch-${i + 1}`,
    field_key: "branch",
    label: `${b.name} (${b.code})`,
    visible: true,
    sort_order: i + 1,
  })),
  ...["Offline at Vadodara", "Offline at Vidyanagar", "Online"].map((label, i) => ({
    id: `opt-enqfor-${i + 1}`,
    field_key: "enquiry_for",
    label,
    visible: true,
    sort_order: i + 1,
  })),
  ...[
    "College seminar/session",
    "Friend or senior referral",
    "Instagram/Social media",
    "Google search",
    "Newspaper",
    "Walk-in",
    "Other",
  ].map((label, i) => ({
    id: `opt-heard-${i + 1}`,
    field_key: "heard_about",
    label,
    visible: true,
    sort_order: i + 1,
  })),
  ...["Offline batch", "Online batch"].map((label, i) => ({
    id: `opt-interested-${i + 1}`,
    field_key: "interested_for",
    label,
    visible: true,
    sort_order: i + 1,
  })),
  // SAMPLE demo slots (Nov 2026) - the free demo form's "Preferred time".
  ...[
    "Saturday · 11:00 AM (Online)",
    "Saturday · 4:00 PM (Vadodara centre)",
    "Sunday · 11:00 AM (Online)",
    "Any day - please call me",
  ].map((label, i) => ({
    id: `opt-demo-slot-${i + 1}`,
    field_key: "demo_slot",
    label,
    visible: true,
    sort_order: i + 1,
  })),
];

/**
 * SRS 8.2 requires a distinct offer per university, but supplies no offer text.
 * A neutral default is used so the flow works end to end without promising a
 * discount the client hasn't approved. Real per-college offers are set in admin.
 */
export const DEFAULT_SEMINAR_OFFER =
  "Thank you for attending our seminar. Our team will call you within 24 hours with the exclusive seminar-attendee offer for your college.";

export const universities: University[] = [
  "Charusat University",
  "Parul University",
  "MSU Baroda",
  "BVM Vallabh Vidyanagar",
  "DDU Nadiad",
  "Navrachana University",
  "GECS",
  "Other",
].map((name, i) => ({
  id: `uni-${i + 1}`,
  name,
  offer_text: DEFAULT_SEMINAR_OFFER,
  visible: true,
  sort_order: i + 1,
}));

// --- SRS 13: meta titles/descriptions must be admin-editable per page ------
export const pageSeo: PageSeo[] = [
  {
    path: "/",
    meta_title: "GATE Coaching in Vadodara, Gujarat | Acumen Gate Academy",
    meta_description:
      "Acumen Gate Academy has been coaching GATE aspirants in Vadodara since 2014, with 10,000+ GATE success stories. Offline and live online batches across six engineering branches, plus GPSC coaching.",
  },
  {
    path: "/about",
    meta_title: "About Acumen Gate Academy | GATE Coaching in Vadodara since 2014",
    meta_description:
      "Founded in 2014 by Rohit Chandorkar, Acumen Gate Academy is one of Gujarat's most trusted GATE coaching institutes, with faculty from IITs, PSUs and government service, and placement support through Acumen 360.",
  },
  {
    path: "/news",
    meta_title: "GATE & PSU Recruitment News | Acumen Gate Academy",
    meta_description:
      "Recruitment notifications and GATE announcements that matter to engineering students in Gujarat, explained in terms of what they mean for your preparation.",
  },
  {
    path: "/courses",
    meta_title: "GATE Coaching Courses in Vadodara & Online | Acumen Gate Academy",
    meta_description:
      "GATE courses for Mechanical, Civil, Computer Science, Electrical, Electronics and Chemical Engineering, plus GPSC coaching. Offline in Vadodara or live online, with full syllabus, batches and fees.",
  },
  {
    path: "/faq",
    meta_title: "GATE FAQs: Exam, Courses, Fees & Demo Class | Acumen Gate Academy",
    meta_description:
      "Answers on GATE eligibility, exam pattern and marking, choosing a batch, fees and GST, online classes, and booking a free demo class at Acumen Gate Academy.",
  },
  {
    path: "/results",
    meta_title: "GATE Results & Student Success Stories | Acumen Gate Academy",
    meta_description:
      "GATE results from Acumen Gate Academy students across MSU, Parul, Charusat, BVM, DDU and Navrachana - with All India Ranks by year, and testimonials in students' own words.",
  },
];

/** SRS 12: copy is pending from the client, and is required before launch. */
export const legalPages: LegalPage[] = [
  { slug: "privacy", title: "Privacy Policy", content: "" },
  { slug: "terms", title: "Terms & Conditions", content: "" },
];

/**
 * Publications that have covered Acumen students, newest first.
 *
 * Kept as plain names rather than masthead logo files: reproducing a
 * newspaper's logo is a trademark question, whereas stating truthfully that a
 * paper covered you is not. The dates match the clippings in
 * `public/assets/press/`, so this list and those images stay in step.
 */
export const PRESS_MENTIONS = [
  { name: "The Times of India", detail: "Ahmedabad · March 2026" },
  { name: "Divya Bhaskar", detail: "Vadodara · March 2026" },
  { name: "Gujarat Samachar", detail: "March 2026" },
  { name: "Sandesh", detail: "Vadodara · March 2026" },
];

/**
 * All India Ranks shown as floating chips in the hero, as "AIR 52" etc.
 *
 * Every number here appears in the newspaper clippings in `public/assets/press/`
 * (Sandesh, Divya Bhaskar, Gujarat Samachar and The Times of India, March
 * 2026), so nothing is claimed that has not already been printed. Ranks only -
 * no names, no totals. The one headline total on the site is the stat line
 * (SRS 7.1.3 / 15.7), and this strip must never turn into a second one.
 *
 * Update for the next GATE cycle by replacing the list.
 */
export const HERO_RANKS = [52, 73, 75, 267, 306, 333];
export const HERO_RANKS_LABEL = "Top ranks, GATE 2026";

/**
 * The client's GATE 26 success-post archive: 56 square images in
 * `public/assets/results/`, listed by file number. The numbering has gaps
 * because the client curated the set - files are listed explicitly rather
 * than counted so a missing number never produces a broken image.
 *
 * Only the first block is flagged for the homepage carousel. SRS 7.1.2 asks for
 * "a curated mix" there, and SRS 7.4 is explicit that the homepage surfaces a
 * curated handful while the Results page is "where the rest actually gets
 * used" - so every post lives in the library, and the Results page shows the
 * lot. Putting every image in the marquee would also work against SRS 3.5,
 * since a 90-second loop would eventually pull all of them down.
 *
 * Every flag here is admin-editable, so the client can move any image between
 * the two placements without a code change. `scripts/sync-results.mjs` pushes
 * this folder into Supabase Storage whenever the set changes.
 */
const CAROUSEL_COUNT = 24;
export const RESULT_POST_FILES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 18, 19, 20, 21, 24, 25,
  26, 28, 30, 32, 33, 34, 36, 39, 40, 46, 47, 49, 50, 52, 53, 54, 57, 58, 59,
  61, 62, 63, 64, 66, 67, 72, 73, 77, 78, 79, 80, 81, 82, 83, 84,
];
const RESULT_POST_COUNT = RESULT_POST_FILES.length;

const resultPosts: GalleryImage[] = RESULT_POST_FILES.map((file, index) => {
  const n = index + 1;
  return {
    id: `gallery-result-${file}`,
    image_url: `/assets/results/${file}.png`,
    // Generic but unique. These posts each name a student, so the client can
    // improve these in the admin panel - see docs/PENDING.md.
    alt_text: `Acumen Gate Academy student qualified in GATE 2026 — success post ${n}`,
    kind: "result" as const,
    show_in_carousel: n <= CAROUSEL_COUNT,
    show_in_news_strip: false,
    sort_order: n,
  };
});

/**
 * The client's newspaper coverage of the GATE 2026 results, from the four
 * publications SRS 7.1.2 names.
 *
 * These appear in BOTH placements on purpose: 7.1.2 describes the homepage
 * carousel as "a curated mix of real student success posts and real newspaper
 * clippings", and 7.2.7 puts the clippings in the About page's "In the News"
 * strip. One upload, two placements.
 *
 * Alt text names the publication and date, because that is the part that
 * carries the credibility and it is what a search engine can read - the
 * headline itself is locked inside the image.
 */
const pressClippings: GalleryImage[] = [
  {
    file: "sandesh-vadodara-2026-03-20.png",
    alt: "Sandesh, Vadodara, 20 March 2026: four students from the city place in the national top 500 in GATE 2026, with All India Ranks 52, 75, 267 and 306.",
  },
  {
    file: "divya-bhaskar-vadodara-2026-03-20.png",
    alt: "Divya Bhaskar, Vadodara, 20 March 2026: Shreyansh Singh secures All India Rank 52 and Gurudutt Dave All India Rank 73 in GATE 2026.",
  },
  {
    file: "gujarat-samachar-2026-03-20.png",
    alt: "Gujarat Samachar, 20 March 2026: a Vadodara student prepares for GATE through cancer treatment and secures All India Rank 75.",
  },
  {
    file: "times-of-india-2026-03-21.png",
    alt: "The Times of India, Ahmedabad, 21 March 2026: 'Battling cancer, MSU student secures top ranks in GATE' — All India Rank 75 in electronics and 333 in electrical engineering.",
  },
  {
    file: "combined-coverage-2026-03.png",
    alt: "Acumen Gate Academy's GATE 2026 results covered across Sandesh, Divya Bhaskar, Gujarat Samachar and The Times of India in March 2026.",
  },
].map((item, index) => ({
  id: `gallery-press-${index + 1}`,
  image_url: `/assets/press/${item.file}`,
  alt_text: item.alt,
  kind: "press" as const,
  show_in_carousel: true,
  show_in_news_strip: true,
  // Numbered past every result post so the two sets never collide once seeded
  // into the database. In the carousel this puts the clippings after the
  // curated results, so the strip opens on students' faces.
  sort_order: RESULT_POST_COUNT + index + 1,
}));

export const galleryImages: GalleryImage[] = [...resultPosts, ...pressClippings];

// ===========================================================================
// Course pages (/courses and /courses/<slug>)
//
// SAMPLE CONTENT (Nov 2026). Overviews and highlights are written from what
// the SRS already says about Acumen. Syllabus subjects follow the official
// GATE syllabus for each paper; the "typical marks" are approximate ranges
// from recent papers and should be checked by the faculty before launch -
// see docs/PENDING.md. Everything here is admin-editable.
// ===========================================================================

const GATE_WHO_SHOULD_JOIN = [
  "Engineering students from 2nd year onwards who want to start early",
  "Final-year students preparing for GATE alongside their degree",
  "Graduates taking a focused attempt for M.Tech, PSU jobs or research",
  "Working engineers who want a structured, mentor-led plan",
].join("\n");

const GATE_COMMON_HIGHLIGHTS = [
  "Complete branch syllabus taught from basics to GATE level",
  "Weekly assignments, chapter tests and a national-level test series",
  "Live and recorded lectures with books in soft copy on the Acumen app",
  "Personal mentoring, with schedules planned around your university exams",
  "Post-GATE guidance for M.Tech admissions and PSU recruitment",
];

interface CourseSeed {
  code: string;
  slug: string;
  title: string;
  short: string;
  tagline: string;
  overview: string;
  extraHighlight: string;
  /** subject, typical marks, topics */
  subjects: Array<[string, string, string[]]>;
}

const MATHS: [string, string, string[]] = [
  "Engineering Mathematics",
  "≈ 13 marks",
  [
    "Linear algebra",
    "Calculus",
    "Differential equations",
    "Complex variables",
    "Probability and statistics",
    "Numerical methods",
  ],
];

const APTITUDE: [string, string, string[]] = [
  "General Aptitude",
  "15 marks",
  [
    "Verbal aptitude",
    "Quantitative aptitude",
    "Analytical aptitude",
    "Spatial aptitude",
  ],
];

const GATE_COURSES: CourseSeed[] = [
  {
    code: "ME",
    slug: "gate-mechanical",
    title: "GATE Mechanical Engineering (ME)",
    short: "Mechanical",
    tagline: "From engineering mechanics to manufacturing - the full ME paper, taught by mentors who have topped it.",
    overview:
      "Our GATE Mechanical Engineering course covers the complete ME syllabus, from engineering mechanics and strength of materials through thermal sciences, design and manufacturing. Concepts are built from first principles and then drilled with GATE-level problems every week, so students can handle both the conceptual 1-mark questions and the long numerical 2-mark questions under exam time.",
    extraHighlight: "Dedicated problem-solving sessions for thermal sciences and manufacturing, the two heaviest ME sections",
    subjects: [
      ["Engineering Mechanics", "≈ 4–6 marks", ["Free-body diagrams and equilibrium", "Friction", "Trusses and frames", "Virtual work", "Kinematics and dynamics of rigid bodies", "Impulse, momentum and collisions"]],
      ["Mechanics of Materials", "≈ 7–9 marks", ["Stress, strain and elastic constants", "Mohr's circle", "Shear force and bending moment", "Bending and shear stresses", "Deflection of beams", "Torsion", "Columns and strain energy", "Thin cylinders"]],
      ["Theory of Machines", "≈ 5–7 marks", ["Velocity and acceleration analysis", "Cams", "Gears and gear trains", "Flywheels and governors", "Balancing", "Gyroscope"]],
      ["Vibrations", "≈ 2–4 marks", ["Free and forced vibration", "Damping", "Resonance and isolation", "Critical speed of shafts"]],
      ["Machine Design", "≈ 4–6 marks", ["Static and fatigue design", "Theories of failure", "Joints", "Shafts", "Gears", "Bearings", "Brakes and clutches", "Springs"]],
      ["Fluid Mechanics", "≈ 7–9 marks", ["Fluid properties and statics", "Buoyancy", "Control-volume analysis", "Bernoulli's equation", "Viscous flow", "Boundary layer", "Flow through pipes"]],
      ["Heat Transfer", "≈ 5–7 marks", ["Conduction and fins", "Lumped capacitance", "Free and forced convection", "Radiation", "Heat exchangers (LMTD and NTU)"]],
      ["Thermodynamics", "≈ 4–6 marks", ["Laws of thermodynamics", "Entropy and exergy", "Properties of pure substances", "Ideal and real gases"]],
      ["Power Plant, IC Engines & Refrigeration", "≈ 5–7 marks", ["Rankine and Brayton cycles", "IC engine cycles", "Vapour compression refrigeration", "Psychrometry", "Turbomachinery"]],
      ["Materials & Manufacturing", "≈ 12–15 marks", ["Engineering materials", "Casting", "Forming", "Joining", "Machining and machine tools", "Metrology and inspection", "Computer-integrated manufacturing"]],
      ["Industrial Engineering", "≈ 4–6 marks", ["Forecasting", "Scheduling", "Inventory control", "Linear programming", "Queuing", "PERT and CPM"]],
    ],
  },
  {
    code: "CE",
    slug: "gate-civil",
    title: "GATE Civil Engineering (CE)",
    short: "Civil",
    tagline: "Structures, geotech, water and transport - every CE section, with design codes made simple.",
    overview:
      "Our GATE Civil Engineering course takes students through all seven sections of the CE paper - structural, geotechnical, water resources, environmental, transportation and geomatics engineering, plus mathematics and aptitude. Mentors who have written the books Civil students study from teach the design-code questions step by step, so the long numerical problems stop being the ones students skip.",
    extraHighlight: "Code-based design practice for RCC and steel, taught by the authors of our Civil foundation books",
    subjects: [
      ["Solid Mechanics", "≈ 8–10 marks", ["Bending moment and shear force", "Simple stress and strain", "Bending and shear stresses", "Torsion", "Mohr's circle", "Deflection of beams", "Columns"]],
      ["Structural Analysis", "≈ 4–6 marks", ["Determinate and indeterminate structures", "Force and displacement methods", "Influence lines", "Matrix methods", "Stability"]],
      ["Concrete Structures", "≈ 4–6 marks", ["Working stress and limit state design", "Beams and slabs", "Columns and footings", "Prestressed concrete basics"]],
      ["Steel Structures", "≈ 3–5 marks", ["Tension and compression members", "Beams", "Connections", "Plastic analysis"]],
      ["Construction Materials & Management", "≈ 3–5 marks", ["Concrete, steel, bricks and timber", "Construction planning", "PERT and CPM", "Cost estimation"]],
      ["Geotechnical Engineering", "≈ 14–17 marks", ["Soil properties and classification", "Permeability and seepage", "Compaction and consolidation", "Shear strength", "Earth pressure", "Shallow and deep foundations", "Slope stability"]],
      ["Fluid Mechanics & Hydraulics", "≈ 8–10 marks", ["Fluid properties and statics", "Bernoulli's equation", "Pipe flow", "Open channel flow", "Hydraulic jump", "Dimensional analysis"]],
      ["Hydrology & Irrigation", "≈ 4–6 marks", ["Hydrologic cycle", "Hydrographs", "Flood estimation", "Groundwater", "Crop water requirement", "Canal design"]],
      ["Environmental Engineering", "≈ 10–12 marks", ["Water quality", "Water and wastewater treatment", "Air pollution", "Noise pollution", "Solid waste management"]],
      ["Transportation Engineering", "≈ 8–10 marks", ["Highway geometric design", "Pavement materials and design", "Traffic engineering", "Intersections and signals"]],
      ["Geomatics Engineering", "≈ 3–5 marks", ["Surveying principles", "Levelling and traversing", "Curves", "Photogrammetry", "Remote sensing and GIS"]],
    ],
  },
  {
    code: "CSE",
    slug: "gate-computer-science",
    title: "GATE Computer Science & IT (CS)",
    short: "Computer Science",
    tagline: "Algorithms to operating systems - the CS paper taught for the way GATE actually asks it.",
    overview:
      "Our GATE Computer Science course covers every core CS subject, from discrete mathematics and data structures through theory of computation, operating systems, databases and networks. GATE CS rewards precise reasoning more than memory, so classes focus on tracing algorithms, writing proofs and solving previous-year questions until the patterns are second nature.",
    extraHighlight: "Taught by CS mentors recognised among India's best GATE faculty, with topic-wise previous-year practice",
    subjects: [
      ["Discrete Mathematics", "within ≈ 13 marks", ["Propositional and first-order logic", "Sets, relations and functions", "Graph theory", "Combinatorics", "Groups"]],
      ["Digital Logic", "≈ 4–6 marks", ["Boolean algebra", "Combinational circuits", "Sequential circuits", "Number representation"]],
      ["Computer Organization & Architecture", "≈ 6–9 marks", ["Machine instructions and addressing modes", "ALU and datapath", "Pipelining", "Memory hierarchy and cache", "I/O interface"]],
      ["Programming & Data Structures", "≈ 8–11 marks", ["Programming in C", "Recursion", "Arrays, stacks and queues", "Linked lists", "Trees and binary search trees", "Heaps and graphs"]],
      ["Algorithms", "≈ 7–10 marks", ["Searching and sorting", "Hashing", "Asymptotic complexity", "Greedy, divide and conquer, dynamic programming", "Graph algorithms"]],
      ["Theory of Computation", "≈ 6–8 marks", ["Regular expressions and finite automata", "Context-free grammars and push-down automata", "Turing machines", "Undecidability"]],
      ["Compiler Design", "≈ 3–5 marks", ["Lexical analysis", "Parsing", "Syntax-directed translation", "Intermediate code generation", "Runtime environments"]],
      ["Operating System", "≈ 7–10 marks", ["Processes and threads", "CPU scheduling", "Synchronisation and deadlock", "Memory management and virtual memory", "File systems"]],
      ["Databases", "≈ 6–8 marks", ["ER model", "Relational algebra and SQL", "Normal forms", "Indexing", "Transactions and concurrency control"]],
      ["Computer Networks", "≈ 6–9 marks", ["Layering and switching", "Data link layer", "IP addressing and routing", "TCP and UDP", "Application layer protocols"]],
    ],
  },
  {
    code: "EE",
    slug: "gate-electrical",
    title: "GATE Electrical Engineering (EE)",
    short: "Electrical",
    tagline: "Machines, power systems and control - built up from circuits to the toughest EE numericals.",
    overview:
      "Our GATE Electrical Engineering course covers the full EE paper, from electric circuits and electromagnetic fields to electrical machines, power systems, control, measurements and power electronics. Because EE subjects build on each other, the course is sequenced so that circuits and signals are solid before machines and power systems begin.",
    extraHighlight: "A sequenced plan where circuits and signals are secure before machines and power systems begin",
    subjects: [
      ["Electric Circuits", "≈ 8–11 marks", ["Network elements and theorems", "Transient response", "Sinusoidal steady state", "Resonance", "Two-port networks", "Three-phase circuits"]],
      ["Electromagnetic Fields", "≈ 3–5 marks", ["Coulomb's and Gauss's laws", "Electric field and potential", "Capacitance", "Biot-Savart and Ampere's laws", "Inductance"]],
      ["Signals & Systems", "≈ 6–8 marks", ["Continuous and discrete signals", "LTI systems", "Fourier series and transform", "Laplace and z-transform", "Sampling"]],
      ["Electrical Machines", "≈ 10–13 marks", ["Transformers", "DC machines", "Induction machines", "Synchronous machines"]],
      ["Power Systems", "≈ 10–13 marks", ["Transmission lines and cables", "Per-unit system", "Load flow", "Fault analysis", "Protection", "Stability", "Economic load dispatch"]],
      ["Control Systems", "≈ 7–9 marks", ["Block diagrams and signal flow graphs", "Time response", "Routh-Hurwitz and root locus", "Bode and Nyquist", "Compensators", "State space"]],
      ["Electrical & Electronic Measurements", "≈ 4–6 marks", ["Bridges and potentiometers", "Measurement of power and energy", "Instrument transformers", "Oscilloscopes", "Error analysis"]],
      ["Analog & Digital Electronics", "≈ 7–9 marks", ["Diode and transistor circuits", "Op-amps", "Combinational and sequential logic", "ADCs and DACs", "Microprocessor basics"]],
      ["Power Electronics", "≈ 7–9 marks", ["Power semiconductor devices", "Rectifiers", "DC-DC converters", "Inverters", "Drives"]],
    ],
  },
  {
    code: "EC",
    slug: "gate-electronics",
    title: "GATE Electronics & Communication (EC)",
    short: "Electronics",
    tagline: "Devices, circuits and communications - the EC paper made clear, one building block at a time.",
    overview:
      "Our GATE Electronics & Communication course covers every section of the EC paper: networks and signals, electronic devices, analog and digital circuits, control systems, communications and electromagnetics. Mentors teach the physics behind each device and circuit before the shortcuts, so students can solve unfamiliar questions rather than only the ones they have seen before.",
    extraHighlight: "Concept-first teaching of devices and circuits, then speed drills for the numerical questions",
    subjects: [
      ["Networks, Signals & Systems", "≈ 12–15 marks", ["Network theorems", "Transient and steady-state analysis", "Two-port networks", "Fourier, Laplace and z-transforms", "LTI systems", "Sampling"]],
      ["Electronic Devices", "≈ 6–9 marks", ["Semiconductor physics", "PN junction", "BJT and MOSFET", "Photodiodes and LEDs", "Device fabrication basics"]],
      ["Analog Circuits", "≈ 9–12 marks", ["Diode circuits", "BJT and MOSFET amplifiers", "Op-amp circuits", "Feedback and oscillators", "Filters"]],
      ["Digital Circuits", "≈ 8–10 marks", ["Number systems and Boolean algebra", "Combinational circuits", "Sequential circuits", "Data converters", "Semiconductor memories"]],
      ["Control Systems", "≈ 7–9 marks", ["Block diagrams", "Time and frequency response", "Stability analysis", "Compensators", "State-space models"]],
      ["Communications", "≈ 10–12 marks", ["Random processes", "Analog modulation", "Information theory", "Digital modulation", "Error-correcting codes"]],
      ["Electromagnetics", "≈ 7–9 marks", ["Maxwell's equations", "Plane waves", "Transmission lines", "Waveguides", "Antennas basics"]],
    ],
  },
  {
    code: "CH",
    slug: "gate-chemical",
    title: "GATE Chemical Engineering (CH)",
    short: "Chemical",
    tagline: "Transport phenomena to reaction engineering - the CH paper, problem by problem.",
    overview:
      "Our GATE Chemical Engineering course covers the full CH paper, from process calculations and thermodynamics through fluid mechanics, heat and mass transfer, reaction engineering, process control and plant design. Chemical Engineering questions are long and numerical, so every topic is paired with timed problem practice from the first week.",
    extraHighlight: "Timed numerical practice in every topic - CH questions reward speed as much as understanding",
    subjects: [
      ["Process Calculations & Thermodynamics", "≈ 10–12 marks", ["Material and energy balances", "Recycle, bypass and purge", "Laws of thermodynamics", "Phase equilibria", "Chemical reaction equilibria"]],
      ["Fluid Mechanics & Mechanical Operations", "≈ 10–13 marks", ["Fluid statics", "Flow through pipes and packed beds", "Pumps and compressors", "Size reduction", "Filtration and settling"]],
      ["Heat Transfer", "≈ 7–9 marks", ["Conduction, convection and radiation", "Heat exchangers", "Boiling and condensation", "Evaporators"]],
      ["Mass Transfer", "≈ 10–12 marks", ["Diffusion", "Mass transfer coefficients", "Distillation", "Absorption", "Extraction and drying"]],
      ["Chemical Reaction Engineering", "≈ 10–12 marks", ["Rate laws and kinetics", "Ideal reactors", "Non-ideal reactors and RTD", "Catalysis"]],
      ["Instrumentation & Process Control", "≈ 6–8 marks", ["Measurement of process variables", "Transfer functions", "Controllers", "Stability and tuning"]],
      ["Plant Design & Economics", "≈ 4–6 marks", ["Cost estimation", "Depreciation", "Profitability analysis", "Optimum design"]],
      ["Chemical Technology", "≈ 3–5 marks", ["Inorganic chemical industries", "Petroleum refining", "Polymers", "Natural products"]],
    ],
  },
];

export const courses: Course[] = [
  ...GATE_COURSES.map((c, i) => ({
    id: `course-${c.slug}`,
    slug: c.slug,
    title: c.title,
    short_title: c.short,
    category: "gate" as const,
    branch_code: c.code,
    tagline: c.tagline,
    overview: c.overview,
    highlights: [...GATE_COMMON_HIGHLIGHTS.slice(0, 2), c.extraHighlight, ...GATE_COMMON_HIGHLIGHTS.slice(2)].join("\n"),
    who_should_join: GATE_WHO_SHOULD_JOIN,
    image_url: "",
    alt_text: `${c.title} coaching at Acumen Gate Academy`,
    meta_title: `${c.title} Coaching in Vadodara & Online | Acumen Gate Academy`,
    meta_description: `${c.title} coaching at Acumen Gate Academy: full syllabus, offline batches in Vadodara and live online batches, fees, start dates and a free demo class.`,
    visible: true,
    sort_order: i + 1,
  })),
  {
    id: "course-gpsc-engineering",
    slug: "gpsc-engineering",
    title: "GPSC Coaching for Engineering Roles",
    short_title: "GPSC",
    category: "gpsc",
    branch_code: "",
    tagline: "Class 1, 2 and 3 engineering posts in Gujarat state service - general studies and technical, together.",
    overview:
      "Dedicated GPSC coaching for engineering roles, covering GPSC Class 1, Class 2 and Class 3 exams, for students and professionals preparing for Gujarat state government engineering services. The course combines general studies and current affairs with the technical subjects of your branch, so preparation for both papers moves forward together.",
    highlights: [
      "Covers GPSC Class 1, Class 2 and Class 3 engineering posts",
      "General studies, current affairs and Gujarat-specific topics",
      "Technical subjects for your branch, taught by GATE faculty",
      "Regular tests in the GPSC pattern",
      "Interview guidance once you clear the written exams",
    ].join("\n"),
    who_should_join: [
      "Engineering graduates aiming for Gujarat state government posts",
      "GATE aspirants who want a parallel government-job route",
      "Working engineers preparing for Class 1 or Class 2 posts",
    ].join("\n"),
    image_url: "",
    alt_text: "GPSC coaching for engineering roles at Acumen Gate Academy",
    meta_title: "GPSC Coaching for Engineers in Vadodara | Acumen Gate Academy",
    meta_description:
      "GPSC coaching for Class 1, 2 and 3 engineering posts: general studies, current affairs and technical subjects, at Acumen Gate Academy, Vadodara.",
    visible: true,
    sort_order: GATE_COURSES.length + 1,
  },
];

const GPSC_SUBJECTS: Array<[string, string, string[]]> = [
  ["General Studies", "", ["History and culture of Gujarat and India", "Geography", "Indian polity and constitution", "Indian and Gujarat economy", "General science"]],
  ["Current Affairs", "", ["National and international events", "Gujarat state schemes and policies", "Science and technology"]],
  ["Reasoning & Aptitude", "", ["Logical reasoning", "Quantitative aptitude", "Data interpretation"]],
  ["Technical Subjects", "", ["Core subjects of your engineering branch", "Previous-year GPSC technical papers", "Short-answer and objective practice"]],
  ["Interview Guidance", "", ["Personality test preparation", "Mock interviews", "Current-affairs discussion"]],
];

export const courseSubjects: CourseSubject[] = [
  ...GATE_COURSES.flatMap((c) =>
    [APTITUDE, MATHS, ...c.subjects].map(([subject, weightage, topics], j) => ({
      id: `subject-${c.slug}-${j + 1}`,
      course_id: `course-${c.slug}`,
      subject,
      // GATE CS folds discrete mathematics into its maths section.
      weightage: c.code === "CSE" && subject === "Engineering Mathematics" ? "≈ 13 marks (with discrete maths)" : weightage,
      topics:
        c.code === "CSE" && subject === "Engineering Mathematics"
          ? ["Linear algebra", "Calculus", "Probability and statistics"].join("\n")
          : topics.join("\n"),
      visible: true,
      sort_order: j + 1,
    })),
  ),
  ...GPSC_SUBJECTS.map(([subject, weightage, topics], j) => ({
    id: `subject-gpsc-engineering-${j + 1}`,
    course_id: "course-gpsc-engineering",
    subject,
    weightage,
    topics: topics.join("\n"),
    visible: true,
    sort_order: j + 1,
  })),
];
