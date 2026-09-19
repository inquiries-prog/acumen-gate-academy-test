import EnrollmentsTable from "./EnrollmentsTable";
import { readRows } from "@/lib/admin/data";
import type { Enrollment } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paid enrollments",
  robots: { index: false, follow: false },
};

/**
 * Paid enrollments (SRS 11.4).
 *
 * Deliberately its own screen, separate from the two lead lists, so a student
 * who has already paid is never mistaken for someone who still needs a sales
 * call - they need onboarding instead.
 */
export default async function AdminEnrollmentsPage() {
  const rows = await readRows<Enrollment>("enrollments", {
    column: "created_at",
    ascending: false,
  });

  return <EnrollmentsTable rows={rows} />;
}
