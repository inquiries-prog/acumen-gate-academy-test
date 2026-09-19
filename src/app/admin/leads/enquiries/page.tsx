import LeadsTable from "@/components/admin/LeadsTable";
import { readRows } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "General enquiries",
  robots: { index: false, follow: false },
};

/** General enquiries - kept separate from seminar leads (SRS 10). */
export default async function AdminEnquiriesPage() {
  const rows = await readRows<Record<string, unknown>>("general_enquiries", {
    column: "created_at",
    ascending: false,
  });

  return (
    <LeadsTable
      table="general_enquiries"
      title="General enquiries"
      description="Everyone who filled in the Enquire Now form, from anywhere on the site. Call each one back within 24 hours."
      exportType="enquiries"
      nameKey="full_name"
      phoneKey="phone"
      columns={[
        { key: "full_name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "branch", label: "Branch" },
        { key: "enquiry_for", label: "Enquiry for" },
        { key: "heard_about", label: "Heard about us" },
        { key: "source", label: "Came from" },
      ]}
      rows={rows}
    />
  );
}
