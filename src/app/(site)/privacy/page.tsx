import type { Metadata } from "next";
import LegalPageView from "@/components/site/LegalPageView";
import { getLegalPage } from "@/lib/content";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Acumen Gate Academy collects and uses the information you share with us.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default async function PrivacyPage() {
  const page = await getLegalPage("privacy");
  return <LegalPageView title={page?.title || "Privacy Policy"} content={page?.content ?? ""} />;
}
