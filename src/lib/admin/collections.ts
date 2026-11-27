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
  /**
   * For a select whose choices are rows of another table (e.g. "Which
   * course"). Resolved on the server when the screen loads.
   */
  optionsFrom?: { table: string; value: string; label: string; orderBy?: string };
  /** A longtext edited in the Word-style editor (formatting and photos), stored as HTML. */
  richText?: boolean;
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
  /**
   * Groups the list under headings by this field (a select). Long lists that
   * belong to a parent - syllabus rows per course, FAQs per category - stay
   * findable this way.
   */
  groupBy?: string;
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
          { value: "batches_offline", label: "The Courses page, showing classroom courses" },
          { value: "batches_online", label: "The Courses page, showing online courses" },
          { value: "enquiry", label: "The enquiry form" },
        ],
      },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "course-pages",
    table: "courses",
    title: "Course pages",
    singular: "course",
    description:
      "One page per course, at /courses/<web address>. The batches, dates and fees on each GATE course page come from 'Batches, dates & fees' for the matching branch; the syllabus comes from 'Course syllabus'.",
    titleField: "title",
    subtitleField: "tagline",
    thumbField: "image_url",
    fields: [
      { name: "title", label: "Course name", type: "text", required: true, placeholder: "GATE Mechanical Engineering (ME)" },
      {
        name: "short_title",
        label: "Short name",
        type: "text",
        help: "Used in the header menu and on small cards, e.g. 'Mechanical'.",
      },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        help: "The end of the page address: gate-mechanical gives /courses/gate-mechanical. Leave blank and one is made from the name. Changing it breaks old links to the page.",
      },
      {
        name: "category",
        label: "Type of course",
        type: "select",
        options: [
          { value: "gate", label: "GATE (shows the GATE exam pattern)" },
          { value: "gpsc", label: "GPSC" },
        ],
      },
      {
        name: "branch_code",
        label: "Branch",
        type: "select",
        optionsFrom: { table: "branches", value: "code", label: "name" },
        help: "Which branch's batches appear on this page. Choose 'None' for a course without batches (it shows an enquiry button instead).",
      },
      { name: "tagline", label: "One-line pitch", type: "textarea", required: true, help: "Shown under the title and on course cards." },
      { name: "overview", label: "Course overview", type: "longtext", required: true },
      { name: "highlights", label: "Highlights", type: "longtext", help: "One per line. Shown as a ticked list." },
      { name: "who_should_join", label: "Who should join", type: "longtext", help: "One per line." },
      {
        name: "syllabus_pdf_url",
        label: "Official syllabus PDF link",
        type: "text",
        placeholder: "https://gate2027.iitm.ac.in/...pdf",
        help: "Opens when students press 'Download official syllabus'. Paste the new link each year when the organising IIT publishes it. Leave blank to hide the button.",
      },
      {
        name: "image_url",
        label: "Card photo",
        type: "image",
        help: "Optional. Without a photo, the card shows the branch's illustration.",
      },
      altField,
      { name: "meta_title", label: "Title shown in Google", type: "text", help: "Keep under about 60 characters." },
      { name: "meta_description", label: "Description shown in Google", type: "textarea", help: "Keep under about 155 characters." },
      visibleField,
      sortField,
    ],
  },
  {
    slug: "course-syllabus",
    table: "course_subjects",
    title: "Course syllabus",
    singular: "syllabus subject",
    description:
      "The syllabus on each course page: one row per subject, with its topics and the marks it typically carries.",
    titleField: "subject",
    subtitleField: "weightage",
    groupBy: "course_id",
    fields: [
      {
        name: "course_id",
        label: "Course",
        type: "select",
        required: true,
        optionsFrom: { table: "courses", value: "id", label: "title" },
      },
      { name: "subject", label: "Subject", type: "text", required: true },
      { name: "topics", label: "Topics", type: "longtext", help: "One per line." },
      {
        name: "weightage",
        label: "Typical marks",
        type: "text",
        placeholder: "≈ 8–10 marks",
        help: "Free text. The bar on the page is drawn from the largest number in it.",
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
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "gate", label: "GATE Exam" },
          { value: "psu", label: "PSU & Jobs" },
          { value: "results", label: "Results" },
          { value: "acumen", label: "Acumen News" },
        ],
      },
      {
        name: "featured",
        label: "Feature this post at the top of News & Updates",
        type: "boolean",
        help: "The newest featured post gets the big spot. Untick older ones when you feature a new one.",
      },
      {
        name: "syllabus_links",
        label: "Show 'download the syllabus' buttons on this post",
        type: "boolean",
        help: "Adds a row of buttons, one per GATE course, each opening that course's syllabus and official PDF.",
      },
      {
        name: "cover_url",
        label: "Cover image",
        type: "image",
        help: "Optional. Without one, the post gets its category's illustrated cover.",
      },
      {
        name: "excerpt",
        label: "One-line summary",
        type: "textarea",
        help: "Shown in the list before someone clicks 'Read more'.",
      },
      {
        name: "content",
        label: "The post",
        type: "longtext",
        required: true,
        richText: true,
        help: "Use the toolbar for headings, bold, lists and indents. To add a photo, click where it should go and press 'Image', or drag or paste one in.",
      },
      {
        name: "published",
        label: "Published",
        type: "boolean",
        help: "Turn off to save a draft nobody can see yet.",
      },
    ],
  },
  {
    slug: "key-dates",
    table: "key_dates",
    title: "Important dates",
    singular: "date",
    description:
      "The upcoming deadlines tracker on News & Updates, each with a live countdown. Dates that have passed disappear from the website on their own.",
    titleField: "title",
    subtitleField: "date",
    orderBy: { column: "date" },
    fields: [
      { name: "title", label: "What happens", type: "text", required: true, placeholder: "GATE 2027 admit cards" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "detail", label: "One-line detail", type: "text" },
      {
        name: "kind",
        label: "Type",
        type: "select",
        options: [
          { value: "exam", label: "GATE exam" },
          { value: "psu", label: "PSU & jobs" },
          { value: "acumen", label: "Acumen (batches, demos, seminars)" },
        ],
      },
      {
        name: "confirmed",
        label: "This date is officially confirmed",
        type: "boolean",
        help: "Leave unticked to show an 'Expected' tag until the official date is announced.",
      },
      { name: "link_url", label: "Link (optional)", type: "text", placeholder: "https://..." },
      { name: "link_label", label: "Link text", type: "text", placeholder: "Official website" },
      visibleField,
    ],
  },
  {
    slug: "faq",
    table: "faqs",
    title: "Frequently asked questions",
    singular: "question",
    description:
      "Every question on the FAQ page, grouped by category. 'About Acumen' questions also appear on the About page, and 'Courses', 'Fees' and 'Free demo' questions on the course pages. Write answers as direct, factual statements — search engines and AI assistants quote these.",
    titleField: "question",
    subtitleField: "answer",
    groupBy: "category",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "gate", label: "The GATE exam" },
          { value: "courses", label: "Courses & batches" },
          { value: "demo", label: "Free demo class" },
          { value: "fees", label: "Fees & payment" },
          { value: "online", label: "Online classes" },
          { value: "about", label: "About Acumen (also shown on the About page)" },
        ],
      },
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
      "The options students can pick in the enquiry, seminar and free demo forms. Add a new center, referral source or demo time slot here without needing a developer. 'Enquiry For' is also the list of ways to attend a free demo (online or at a centre).",
    titleField: "label",
    subtitleField: "field_key",
    groupBy: "field_key",
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
          { value: "demo_slot", label: "Preferred time (free demo form)" },
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
      "While the Page text box is empty, the website shows our standard wording (see /privacy and /terms). To change it, paste the complete text here. Start a line with ## for a heading, ### for a sub-heading and - for a bullet point, and put **two stars** around words to make them bold.",
    fields: [
      { name: "slug", label: "Page", type: "text", hidden: true },
      { name: "title", label: "Page heading", type: "text", required: true },
      { name: "content", label: "Page text (leave empty to use the standard wording)", type: "longtext" },
    ],
  },
];

export function getCollection(slug: string): CollectionDef | undefined {
  return collections.find((c) => c.slug === slug);
}
