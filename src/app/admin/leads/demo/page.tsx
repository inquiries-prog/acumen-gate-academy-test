import LeadsTable from "@/components/admin/LeadsTable";
import { readRows } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Free demo registrations",
  robots: { index: false, follow: false },
};

/**
 * Free demo class bookings - a separate list from general enquiries and
 * seminar leads, because each one needs a call to confirm a date and time.
 */
export default async function AdminDemoPage() {
  const rows = await readRows<Record<string, unknown>>("demo_registrations", {
    column: "created_at",
    ascending: false,
  });

  return (
    <LeadsTable
      table="demo_registrations"
      title="Free demo registrations"
      description="Everyone who booked a free demo class. Call each one to confirm the date and time of their demo, then mark them as contacted."
      exportType="demo"
      nameKey="full_name"
      phoneKey="phone"
      columns={[
        { key: "full_name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "branch", label: "Branch" },
        { key: "mode", label: "Demo" },
        { key: "preferred_slot", label: "Preferred time" },
        { key: "source", label: "Came from" },
        { key: "confirmation_status", label: "WhatsApp" },
      ]}
      rows={rows}
    />
  );
}
