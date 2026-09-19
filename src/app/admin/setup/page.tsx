import SetupClient from "./SetupClient";
import { countRows } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "First-time setup",
  robots: { index: false, follow: false },
};

/**
 * One-time setup screen.
 *
 * After the migrations have been run against a fresh Supabase project, this
 * loads the starting content so the client opens a site that already matches
 * what was agreed, rather than a blank one they have to fill from nothing.
 */
export default async function AdminSetupPage() {
  const [mentors, faqs, branches] = await Promise.all([
    countRows("mentors"),
    countRows("faqs"),
    countRows("branches"),
  ]);

  const alreadySeeded = mentors > 0 || faqs > 0 || branches > 0;

  return <SetupClient alreadySeeded={alreadySeeded} />;
}
