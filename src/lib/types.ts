// Shapes mirror supabase/migrations/0001_init.sql exactly.

export type BannerAction = "seminar" | "enquiry" | "url" | "none";

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

/** A branch joined with its batch for one mode - what the batches modal renders. */
export interface BranchBatch {
  branch: Branch;
  batch: Batch | null;
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
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  published: boolean;
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

export interface Faq {
  id: string;
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
