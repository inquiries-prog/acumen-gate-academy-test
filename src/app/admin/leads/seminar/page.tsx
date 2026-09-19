import LeadsTable from "@/components/admin/LeadsTable";
import { readRows } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seminar leads",
  robots: { index: false, follow: false },
};

/** Seminar attendees - a distinct list from general enquiries (SRS 10). */
export default async function AdminSeminarLeadsPage() {
  const rows = await readRows<Record<string, unknown>>("seminar_leads", {
    column: "created_at",
    ascending: false,
  });

  return (
    <LeadsTable
      table="seminar_leads"
      title="Seminar leads"
      description="Students who told us they attended one of your college seminars, and saw their college's offer. These are warmer than general enquiries — they have already met you."
      exportType="seminar"
      nameKey="full_name"
      phoneKey="mobile"
      columns={[
        { key: "full_name", label: "Name" },
        { key: "mobile", label: "Mobile" },
        { key: "branch", label: "Branch" },
        { key: "university", label: "University" },
        { key: "city", label: "City" },
        { key: "interested_for", label: "Interested for" },
        { key: "offer_shown", label: "Offer shown" },
      ]}
      rows={rows}
    />
  );
}
