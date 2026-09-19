import { formatRupees, gstDetailsConfigured } from "./payments";
import type { Enrollment } from "./types";

/**
 * GST tax invoice generation (SRS 11.3, 11.4).
 *
 * The client holds a GST registration, so a paid enrollment must produce a
 * proper tax invoice - this is a legal requirement, not a nicety.
 *
 * Two things are still pending from the client (see docs/PENDING.md) and this
 * module refuses to issue an invoice without them:
 *   - the registered legal name, address and GSTIN (SRS 12);
 *   - confirmation of whether tax should be shown as a single 18% line, or
 *     split CGST 9% + SGST 9% for Gujarat customers and IGST 18% for
 *     out-of-state ones. The SRS specifies only "GST at 18% ... as a separate
 *     line", so that is what is rendered here; the split is a question for the
 *     client's accountant before launch.
 */

export interface InvoiceInput {
  enrollment: Enrollment;
  invoiceNumber: string;
  issuedOn: Date;
}

/** Sequential invoice numbers, e.g. AGA/2026-27/000123. */
export function formatInvoiceNumber(sequence: number, when = new Date()): string {
  // Indian financial year runs April to March.
  const year = when.getMonth() >= 3 ? when.getFullYear() : when.getFullYear() - 1;
  const fy = `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
  return `AGA/${fy}/${String(sequence).padStart(6, "0")}`;
}

export function canIssueInvoice(): boolean {
  return gstDetailsConfigured();
}

export function renderInvoiceHtml({ enrollment, invoiceNumber, issuedOn }: InvoiceInput): string {
  const legalName = process.env.BUSINESS_LEGAL_NAME ?? "";
  const gstin = process.env.BUSINESS_GSTIN ?? "";
  const address = process.env.BUSINESS_ADDRESS ?? "";

  const date = issuedOn.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Tax Invoice ${escapeHtml(invoiceNumber)}</title></head>
<body style="margin:0;padding:24px;background:#FBF9F8;font-family:Arial,Helvetica,sans-serif;color:#231F20">
  <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #EDEBE9;border-radius:10px">
    <tr><td style="padding:24px">
      <h1 style="margin:0;font-size:18px">Tax Invoice</h1>
      <p style="margin:4px 0 20px;font-size:13px;color:#5A5A5A">
        Invoice No: <strong style="color:#231F20">${escapeHtml(invoiceNumber)}</strong><br>
        Date: ${escapeHtml(date)}
      </p>

      <table role="presentation" width="100%" style="font-size:13px;color:#5A5A5A">
        <tr>
          <td style="vertical-align:top;padding-right:16px;width:50%">
            <strong style="color:#231F20">Supplier</strong><br>
            ${escapeHtml(legalName)}<br>
            ${escapeHtml(address).replace(/\n/g, "<br>")}<br>
            GSTIN: ${escapeHtml(gstin)}
          </td>
          <td style="vertical-align:top;width:50%">
            <strong style="color:#231F20">Billed to</strong><br>
            ${escapeHtml(enrollment.full_name)}<br>
            ${escapeHtml(enrollment.billing_address).replace(/\n/g, "<br>")}<br>
            ${escapeHtml(enrollment.email)}<br>
            ${escapeHtml(enrollment.phone)}
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" style="margin-top:22px;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#FBF9F8">
            <th align="left"  style="padding:10px;border:1px solid #EDEBE9">Description</th>
            <th align="right" style="padding:10px;border:1px solid #EDEBE9">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px;border:1px solid #EDEBE9">
              GATE coaching course fee — ${escapeHtml(enrollment.batch_label)}
            </td>
            <td align="right" style="padding:10px;border:1px solid #EDEBE9">
              ${formatRupees(Number(enrollment.fee_amount))}
            </td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #EDEBE9">GST @ ${Number(enrollment.gst_rate)}%</td>
            <td align="right" style="padding:10px;border:1px solid #EDEBE9">
              ${formatRupees(Number(enrollment.gst_amount))}
            </td>
          </tr>
          <tr style="background:#FBF9F8">
            <td style="padding:10px;border:1px solid #EDEBE9"><strong>Total paid</strong></td>
            <td align="right" style="padding:10px;border:1px solid #EDEBE9">
              <strong>${formatRupees(Number(enrollment.total_amount))}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <p style="margin:18px 0 0;font-size:12px;color:#767671">
        Payment reference: ${escapeHtml(enrollment.payment_ref || "-")}<br>
        This is a computer-generated invoice and does not require a signature.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
