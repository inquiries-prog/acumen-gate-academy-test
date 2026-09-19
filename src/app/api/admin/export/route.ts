import { getAdminUser } from "@/lib/admin/auth";
import { getServiceClient } from "@/lib/supabase";

/**
 * CSV export for leads and enrollments (SRS 9.2, 14).
 *
 * The client must be able to take their data with them - it is theirs, and the
 * SRS is explicit that nothing should be locked into a proprietary format.
 */

const EXPORTS = {
  enquiries: {
    table: "general_enquiries",
    filename: "general-enquiries",
    columns: [
      ["created_at", "Received"],
      ["full_name", "Name"],
      ["phone", "Phone"],
      ["branch", "Branch"],
      ["enquiry_for", "Enquiry for"],
      ["heard_about", "Heard about us"],
      ["source", "Came from"],
      ["contacted", "Contacted"],
      ["notes", "Notes"],
    ],
  },
  seminar: {
    table: "seminar_leads",
    filename: "seminar-leads",
    columns: [
      ["created_at", "Received"],
      ["full_name", "Name"],
      ["mobile", "Mobile"],
      ["branch", "Branch"],
      ["university", "University"],
      ["city", "City"],
      ["interested_for", "Interested for"],
      ["offer_shown", "Offer shown"],
      ["contacted", "Contacted"],
      ["notes", "Notes"],
    ],
  },
  enrollments: {
    table: "enrollments",
    filename: "enrollments",
    columns: [
      ["created_at", "Started"],
      ["paid_at", "Paid"],
      ["status", "Status"],
      ["full_name", "Name"],
      ["phone", "Phone"],
      ["email", "Email"],
      ["batch_label", "Batch"],
      ["fee_amount", "Fee"],
      ["gst_amount", "GST"],
      ["total_amount", "Total"],
      ["invoice_number", "Invoice number"],
      ["payment_ref", "Payment reference"],
      ["billing_address", "Billing address"],
    ],
  },
} as const;

type ExportKey = keyof typeof EXPORTS;

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return new Response("Not signed in.", { status: 401 });

  const type = new URL(request.url).searchParams.get("type") ?? "";
  if (!(type in EXPORTS)) return new Response("Unknown export.", { status: 400 });
  const config = EXPORTS[type as ExportKey];

  const supabase = getServiceClient();
  if (!supabase) return new Response("The database isn't connected.", { status: 503 });

  const { data, error } = await supabase
    .from(config.table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[export] failed:", error.message);
    return new Response("Could not build the export.", { status: 500 });
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const header = config.columns.map(([, label]) => csvCell(label)).join(",");
  const body = rows
    .map((row) => config.columns.map(([key]) => csvCell(format(row[key]))).join(","))
    .join("\r\n");

  // A BOM makes Excel open UTF-8 correctly, which matters for Indian names.
  const csv = `﻿${header}\r\n${body}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${config.filename}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function format(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString("en-IN");
  }
  return String(value);
}

/**
 * Quotes a CSV field. The leading apostrophe guard stops spreadsheet software
 * from executing a field that starts with =, +, - or @ as a formula.
 */
function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${guarded.replace(/"/g, '""')}"`;
}
