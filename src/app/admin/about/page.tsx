import AboutEditor from "./AboutEditor";
import { getAboutBlocks } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us text",
  robots: { index: false, follow: false },
};

/**
 * About Us copy (SRS 7.2, 9.2).
 *
 * Kept as three named blocks rather than one big editor, so the client edits
 * exactly the paragraph they mean to.
 */
export default async function AdminAboutPage() {
  const blocks = await getAboutBlocks();

  return (
    <AboutEditor
      blocks={[
        {
          key: "opening",
          name: "Opening statement",
          note: "The first paragraph on the About page. This is the single most important paragraph for Google and AI assistants — keep it factual and specific.",
          heading: blocks.opening?.heading ?? "",
          body: blocks.opening?.body ?? "",
        },
        {
          key: "story",
          name: "Our Story",
          note: "The founder's story and how the three ventures fit together.",
          heading: blocks.story?.heading ?? "",
          body: blocks.story?.body ?? "",
        },
        {
          key: "different",
          name: "What Makes Us Different",
          note: "Leave a blank line between paragraphs to split them.",
          heading: blocks.different?.heading ?? "",
          body: blocks.different?.body ?? "",
        },
      ]}
    />
  );
}
