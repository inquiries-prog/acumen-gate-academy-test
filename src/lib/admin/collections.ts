/**
 * Admin content registry (SRS 9.2).
 *
 * Every editable list on the site is described here once, and the generic
 * editor at /admin/c/[collection] renders it. Adding a new editable list is a
 * matter of adding an entry - not building another screen - which is what keeps
 * all of them consistent and plain-language.
 *
 * Labels are written for a non-technical reader: "Photo", not "asset"; "Show on
 * the website", not "visible boolean".
 */

export type FieldType =
  | "text"
  | "textarea"
  | "longtext"
  | "number"
  | "money"
  | "boolean"
  | "image"
  | "select"
  | "date";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** Hidden from the form, but kept when saving (e.g. sort_order). */
  hidden?: boolean;
  placeholder?: string;
}

export interface CollectionDef {
  slug: string;
  table: string;
  /** Primary key column. Most tables use a uuid "id"; a few are keyed by text. */
  pk?: string;
  /** Plain-language plural, used as the screen title. */
  title: string;
  singular: string;
  description: string;
  /** Field shown as the row heading in the list. */
  titleField: string;
  /** Optional second line in the list. */
  subtitleField?: string;
  /** Image shown as the row thumbnail. */
  thumbField?: string;
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
  /** Some lists are fixed-length by design and must not grow or shrink. */
  allowCreate?: boolean;
  allowDelete?: boolean;
  /** Shown at the top of the screen when there is something to warn about. */
  notice?: string;
}

const visibleField: FieldDef = {
  name: "visible",
  label: "Show on the website",
  type: "boolean",
  help: "Turn this off to hide it without deleting it.",
};

const sortField: FieldDef = {
  name: "sort_order",
  label: "Display order",
  type: "number",
  help: "Lower numbers appear first.",
};

const altField: FieldDef = {
  name: "alt_text",
  label: "Photo description",
  type: "text",
  help: "Describes the photo for search engines and for visitors using a screen reader.",
};

export const collections: CollectionDef[] = [
  {
    slug: "gallery",
    table: "gallery_images",
    title: "Result & press images",
    singular: "image",
    description:
      "The library behind the scrolling strip on the homepage and the 'In the News' strip on the About page. Add as many as you like — this is not limited to the images you started with.",
    titleField: "alt_text",
    subtitleField: "kind",
    thumbField: "image_url",
    fields: [
      { name: "image_url", label: "Image", type: "image", required: true },
      { ...altField, required: true },
      {
        name: "kind",
        label: "What kind of image is this?",
        type: "select",
        options: [
          { value: "result", label: "Student result" },
          { value: "press", label: "Newspaper clipping" },
        ],
      },
      {
        name: "show_in_carousel",
        label: "Show in the homepage scrolling strip",
        type: "boolean",
      },
      {
        name: "show_in_news_strip",
        label: "Show in 'In the News' on the About page",
        type: "boolean",
      },
      sortField,
    ],
  },
  {
    slug: "courses",
    table: "course_cards",
    title: "Our Courses cards",
    singular: "course card",
    description: "The three cards in the 'Our Courses' section of the homepage.",
    titleField: "title",
    subtitleField: "banner_label",
    thumbField: "image_url",
    // Three fixed cards by design (SRS 15.3) - the third is GPSC Coaching.
    allowCreate: false,
    allowDelete: false,
    fields: [
      { name: "title", label: "Card title", type: "text", required: true },
      { name: "banner_label", label: "Small label on the photo", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "image_url", label: "Photo", type: "image" },
      altField,
      { name: "button_label", label: "Button text", type: "text" },
      {
        name: "action",
        label: "What the button opens",
        type: "select",
        options: [
          { value: "batches_offline", label: "The offline batches popup" },
          { value: "batches_online", label: "The online batches popup" },
          { value: "enquiry", label: "The enquiry form" },
        ],
      },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "why-choose",
    table: "why_choose_cards",
    title: "Why Choose Acumen cards",
    singular: "card",
    description: "The six reasons shown on the homepage. All six look the same by design.",
    titleField: "heading",
    subtitleField: "body",
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "body", label: "Text", type: "textarea", required: true },
      sortField,
    ],
  },
  {
    slug: "mentors",
    table: "mentors",
    title: "Mentors",
    singular: "mentor",
    description:
      "The faculty shown in 'Meet the Mentors' on the homepage. This is the only place faculty appear on the site.",
    titleField: "name",
    subtitleField: "bio",
    thumbField: "image_url",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "title", label: "Title", type: "text", placeholder: "Lead Mentor" },
      { name: "bio", label: "Short bio", type: "textarea", required: true },
      { name: "image_url", label: "Photo", type: "image" },
      altField,
      visibleField,
      sortField,
    ],
  },
  {
    slug: "testimonials",
    table: "testimonials",
    title: "Success stories & testimonials",
    singular: "story",
    description:
      "Student stories. Choose whether each one appears on the homepage or on the Results page. A story can be a photo with a quote, or a video.",
    titleField: "student_name",
    subtitleField: "university",
    thumbField: "image_url",
    fields: [
      { name: "student_name", label: "Student name", type: "text", required: true },
      { name: "university", label: "University", type: "text" },
      { name: "rank_branch", label: "Rank / branch", type: "text", placeholder: "AIR 128 · Mechanical" },
      { name: "quote", label: "What the student said", type: "textarea" },
      {
        name: "scope",
        label: "Where it appears",
        type: "select",
        options: [
          { value: "home", label: "Homepage" },
          { value: "results", label: "Results page" },
        ],
      },
      {
        name: "media_type",
        label: "Photo or video?",
        type: "select",
        options: [
          { value: "photo", label: "Photo with a quote" },
          { value: "video", label: "Video testimonial" },
        ],
      },
      { name: "image_url", label: "Photo (or video thumbnail)", type: "image" },
      altField,
      {
        name: "video_id",
        label: "YouTube video ID",
        type: "text",
        help: "Only needed for video testimonials. From youtube.com/watch?v=ABC123, the ID is ABC123.",
      },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "news",
    table: "news_posts",
    title: "News & Updates posts",
    singular: "post",
    description:
      "Recruitment notifications and GATE news. Keep it quick: a title, a one-line summary, the post itself, and publish.",
    titleField: "title",
    subtitleField: "excerpt",
    orderBy: { column: "published_at", ascending: false },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        help: "Leave blank and one will be created from the title.",
      },
      { name: "published_at", label: "Date", type: "date", required: true },
      {
        name: "excerpt",
        label: "One-line summary",
        type: "textarea",
        help: "Shown in the list before someone clicks 'Read more'.",
      },
      { name: "content", label: "The post", type: "longtext", required: true },
      {
        name: "published",
        label: "Published",
        type: "boolean",
        help: "Turn off to save a draft nobody can see yet.",
      },
    ],
  },
  {
    slug: "faq",
    table: "faqs",
    title: "Frequently asked questions",
    singular: "question",
    description:
      "The FAQ on the About page. Write answers as direct, factual statements — search engines and AI assistants quote these.",
    titleField: "question",
    subtitleField: "answer",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "longtext", required: true },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "seminar-offers",
    table: "universities",
    title: "Seminar offers by college",
    singular: "college",
    description:
      "The colleges listed in the seminar form, and the offer each one's students see after they submit it.",
    titleField: "name",
    subtitleField: "offer_text",
    fields: [
      { name: "name", label: "College / university name", type: "text", required: true },
      {
        name: "offer_text",
        label: "Offer shown to students from this college",
        type: "textarea",
        required: true,
        help: "This exact text is shown on screen once a student submits the seminar form.",
      },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "ecosystem",
    table: "ecosystem_cards",
    title: "Ecosystem cards",
    singular: "card",
    description:
      "The three cards in 'Not Just Coaching — An Ecosystem' on the About page. Acumen Gate Academy is highlighted as the lead entity.",
    titleField: "name",
    subtitleField: "description",
    thumbField: "logo_url",
    allowCreate: false,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "year", label: "Year founded", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "logo_url", label: "Logo", type: "image", help: "Used for the footer badges too." },
      {
        name: "highlighted",
        label: "Highlight this card",
        type: "boolean",
        help: "Keep this on for Acumen Gate Academy only — it must read as the lead entity.",
      },
      sortField,
    ],
  },
  {
    slug: "centers",
    table: "centers",
    title: "Our centers",
    singular: "center",
    description: "Shown on the About page and in the footer.",
    titleField: "name",
    subtitleField: "label",
    fields: [
      { name: "name", label: "Center name", type: "text", required: true },
      { name: "label", label: "Label", type: "text", placeholder: "Head Office" },
      { name: "address", label: "Full address", type: "textarea" },
      {
        name: "show_address",
        label: "Show the address on the website",
        type: "boolean",
        help: "Off for Vidyanagar — it is a weekend center, not a permanent office, so no address is shown.",
      },
      { name: "description", label: "Short description", type: "textarea" },
      { name: "phone", label: "Phone number", type: "text" },
      sortField,
    ],
  },
  {
    slug: "pedagogy",
    table: "pedagogy_points",
    title: "What every batch includes",
    singular: "point",
    description:
      "The checklist shown in the batch details popup and in 'Our Pedagogy' on the About page.",
    titleField: "text",
    fields: [
      { name: "text", label: "Point", type: "text", required: true },
      sortField,
    ],
  },
  {
    slug: "form-options",
    table: "form_options",
    title: "Form dropdown choices",
    singular: "choice",
    description:
      "The options students can pick in the enquiry and seminar forms. Add a new center or referral source here without needing a developer.",
    titleField: "label",
    subtitleField: "field_key",
    fields: [
      {
        name: "field_key",
        label: "Which dropdown",
        type: "select",
        required: true,
        options: [
          { value: "branch", label: "Branch" },
          { value: "enquiry_for", label: "Enquiry For" },
          { value: "heard_about", label: "How did you hear about us?" },
          { value: "interested_for", label: "Interested For (seminar form)" },
        ],
      },
      { name: "label", label: "Choice text", type: "text", required: true },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "seo",
    table: "page_seo",
    pk: "path",
    title: "Page titles for Google",
    singular: "page",
    description:
      "The title and description Google shows for each page. Keep titles under about 60 characters and descriptions under about 155.",
    titleField: "path",
    subtitleField: "meta_title",
    allowCreate: false,
    allowDelete: false,
    orderBy: { column: "path" },
    fields: [
      { name: "path", label: "Page", type: "text", required: true, hidden: true },
      { name: "meta_title", label: "Title shown in Google", type: "text", required: true },
      { name: "meta_description", label: "Description shown in Google", type: "textarea" },
    ],
  },
  {
    slug: "legal",
    table: "legal_pages",
    pk: "slug",
    title: "Privacy Policy & Terms",
    singular: "page",
    description:
      "Both pages are required before the site goes live, because online payment is live from day one.",
    titleField: "title",
    allowCreate: false,
    allowDelete: false,
    orderBy: { column: "slug" },
    notice:
      "These pages are still empty. Paste the wording your legal adviser provides — until then the pages tell visitors to call instead.",
    fields: [
      { name: "slug", label: "Page", type: "text", hidden: true },
      { name: "title", label: "Page heading", type: "text", required: true },
      { name: "content", label: "Page text", type: "longtext" },
    ],
  },
];

export function getCollection(slug: string): CollectionDef | undefined {
  return collections.find((c) => c.slug === slug);
}
