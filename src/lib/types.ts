// Shapes mirror supabase/migrations/0001_init.sql exactly.

export type BannerAction = "seminar" | "enquiry" | "demo" | "url" | "none";

export interface SiteSettings {
  banner_enabled: boolean;
  banner_text: string;
  banner_link_label: string;
  banner_link_action: BannerAction;
  banner_link_url: string;
  hero_headline: string;
  hero_tagline: string;
  hero_primary_cta: string;
  hero_secondary_cta: string;
  stat_line: string;
  phone: string;
  email: string;
  footer_tagline: string;
  instagram_url: string;
  youtube_url: string;
  facebook_url: string;
  google_rating: string;
  google_reviews_count: string;
  google_reviews_url: string;
  logo_url: string;
  acumen360_logo_url: string;
  etude360_logo_url: string;
  final_cta_heading: string;
  final_cta_button: string;
  /** e.g. "GATE 2027". Shown with the countdown. */
  gate_exam_label: string;
  /** ISO date (YYYY-MM-DD) of the first exam day. Blank hides the countdown. */
  gate_exam_date: string;
  /** Free demo side panel. */
  demo_heading: string;
  demo_subtext: string;
  /** Whether the gentle one-time "book a free demo" prompt appears. */
  demo_nudge_enabled: boolean;
  /** Seconds on the site before that prompt appears. Stored as text. */
  demo_nudge_seconds: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  kind: "result" | "press";
  show_in_carousel: boolean;
  show_in_news_strip: boolean;
  sort_order: number;
}

/**
 * What a homepage course card links to. The stored values predate the course
 * pages (they used to open the batches popups) and are kept so no database
 * change is needed: `batches_offline` now means the courses page filtered to
 * offline, `batches_online` to online.
 */
export type CourseAction = "batches_offline" | "batches_online" | "enquiry";

export interface CourseCard {
  id: string;
  title: string;
  banner_label: string;
  description: string;
  image_url: string;
  alt_text: string;
  action: CourseAction;
  button_label: string;
  visible: boolean;
  sort_order: number;
}

export type BatchMode = "offline" | "online";

export interface Branch {
  id: string;
  code: string;
  name: string;
  visible: boolean;
  sort_order: number;
}

export interface Batch {
  id: string;
  branch_id: string;
  mode: BatchMode;
  /** e.g. "Weekday Regular Batch". Blank falls back to "<Mode> batch". */
  title: string;
  /** e.g. "Mon-Fri, 5:30-8:30 PM". */
  schedule: string;
  /** Teaching language, e.g. "English + Hindi". */
  medium: string;
  /** Optional short label on the batch, e.g. "New". */
  badge: string;
  start_date: string;
  duration: string;
  faculty: string;
  fees: number | null;
  fees_note: string;
  seats: string;
  video_id: string;
  video_start: number;
  enroll_enabled: boolean;
  visible: boolean;
  sort_order: number;
}

export type CourseCategory = "gate" | "gpsc";

/** One course page, /courses/<slug>. */
export interface Course {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  category: CourseCategory;
  /** Batches of the branch with this code are listed on the page. */
  branch_code: string;
  tagline: string;
  overview: string;
  /** One per line. */
  highlights: string;
  /** One per line. */
  who_should_join: string;
  image_url: string;
  alt_text: string;
  meta_title: string;
  meta_description: string;
  /** Link to the official syllabus PDF (opened in a new tab). Blank hides the button. */
  syllabus_pdf_url: string;
  visible: boolean;
  sort_order: number;
}

/** One syllabus row on a course page. */
export interface CourseSubject {
  id: string;
  course_id: string;
  subject: string;
  /** One per line. */
  topics: string;
  weightage: string;
  visible: boolean;
  sort_order: number;
}

/** The slice of a course the header menu and popups need on every page. */
export interface CourseNavItem {
  slug: string;
  title: string;
  short_title: string;
  category: CourseCategory;
  branch_code: string;
}

export interface PedagogyPoint {
  id: string;
  text: string;
  sort_order: number;
}

export interface WhyChooseCard {
  id: string;
  heading: string;
  body: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  scope: "home" | "results";
  media_type: "photo" | "video";
  image_url: string;
  alt_text: string;
  video_id: string;
  student_name: string;
  university: string;
  rank_branch: string;
  quote: string;
  visible: boolean;
  sort_order: number;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string;
  alt_text: string;
  visible: boolean;
  sort_order: number;
}

export interface ResultYear {
  id: string;
  label: string;
  year: number;
  visible: boolean;
  sort_order: number;
}

export interface ResultEntry {
  id: string;
  year_id: string;
  student_name: string;
  image_url: string;
  alt_text: string;
  university: string;
  branch: string;
  air: string;
  visible: boolean;
  sort_order: number;
  /** True: an Acumen success post (the face is cut from its circle). False: a plain portrait. */
  photo_is_post: boolean;
  /** Team-only flag shown in admin (e.g. a possible duplicate). Never public. */
  review_note: string;
}

export type NewsCategory = "gate" | "psu" | "results" | "acumen";

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  published: boolean;
  category: NewsCategory;
  /** Optional cover image; without one the post gets its category's cover art. */
  cover_url: string;
  /** The big story at the top of /news (the newest featured post wins). */
  featured: boolean;
}

/** An upcoming deadline in the News & Updates dates tracker. */
export interface KeyDate {
  id: string;
  title: string;
  /** YYYY-MM-DD. Past dates drop off the tracker automatically. */
  date: string;
  detail: string;
  kind: "exam" | "psu" | "acumen";
  /** False shows an "Expected" tag (not yet confirmed by the official body). */
  confirmed: boolean;
  link_url: string;
  link_label: string;
  visible: boolean;
  sort_order: number;
}

export interface AboutBlock {
  key: string;
  heading: string;
  body: string;
}

export interface EcosystemCard {
  id: string;
  name: string;
  year: string;
  description: string;
  logo_url: string;
  highlighted: boolean;
  sort_order: number;
}

export interface Center {
  id: string;
  name: string;
  label: string;
  address: string;
  show_address: boolean;
  description: string;
  phone: string;
  sort_order: number;
}

export type FaqCategory = "gate" | "courses" | "demo" | "fees" | "online" | "about";

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  visible: boolean;
  sort_order: number;
}

export interface FormOption {
  id: string;
  field_key: string;
  label: string;
  visible: boolean;
  sort_order: number;
}

export interface University {
  id: string;
  name: string;
  offer_text: string;
  visible: boolean;
  sort_order: number;
}

export interface PageSeo {
  path: string;
  meta_title: string;
  meta_description: string;
}

export interface LegalPage {
  slug: string;
  title: string;
  content: string;
}

export interface GeneralEnquiry {
  id: string;
  full_name: string;
  phone: string;
  branch: string;
  enquiry_for: string;
  heard_about: string;
  source: string;
  contacted: boolean;
  notes: string;
  created_at: string;
}

export interface SeminarLead {
  id: string;
  full_name: string;
  mobile: string;
  branch: string;
  university: string;
  city: string;
  interested_for: string;
  offer_shown: string;
  contacted: boolean;
  notes: string;
  created_at: string;
}

export interface DemoRegistration {
  id: string;
  full_name: string;
  phone: string;
  branch: string;
  mode: string;
  preferred_slot: string;
  source: string;
  contacted: boolean;
  notes: string;
  created_at: string;
}

export type EnrollmentStatus = "initiated" | "paid" | "failed" | "abandoned";

export interface Enrollment {
  id: string;
  batch_id: string | null;
  batch_label: string;
  full_name: string;
  phone: string;
  email: string;
  billing_address: string;
  fee_amount: number;
  gst_amount: number;
  total_amount: number;
  gst_rate: number;
  status: EnrollmentStatus;
  provider: string;
  payment_ref: string;
  invoice_number: string;
  contacted: boolean;
  created_at: string;
  paid_at: string | null;
}
