"use client";

import { useMemo, useState, useTransition } from "react";
import { StatusMessage } from "@/components/admin/Fields";
import { setLeadContacted, type ActionResult } from "@/lib/admin/actions";
import { formatRupees } from "@/lib/payments";
import type { Enrollment, EnrollmentStatus } from "@/lib/types";
import { telHref } from "@/lib/utils";

/**
 * Enrollments and payments (SRS 9.2, 11.4, 11.5).
 *
 * Paid students and unfinished payments live on the same screen but are clearly
 * separated by status, because they need opposite actions: onboard the first
 * group, chase the second. Nothing is ever dropped - an abandoned payment stays
 * here as a lead to follow up.
 */

const STATUS_LABELS: Record<EnrollmentStatus, { label: string; tone: string; hint: string }> = {
  paid: {
    label: "Paid",
    tone: "bg-green-100 text-green-800",
    hint: "Payment received — onboard this student.",
  },
  initiated: {
    label: "Didn't finish",
    tone: "bg-amber-100 text-amber-900",
    hint: "They started paying and stopped. Call them and help finish it.",
  },
  failed: {
    label: "Payment failed",
    tone: "bg-red/10 text-red-dark",
    hint: "Their payment was declined. Call them and help finish it.",
  },
  abandoned: {
    label: "Abandoned",
    tone: "bg-offwhite text-muted",
    hint: "Marked as abandoned.",
  },
};

export default function EnrollmentsTable({ rows }: { rows: Enrollment[] }) {
  const [filter, setFilter] = useState<"all" | "paid" | "unfinished">("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "paid" && row.status !== "paid") return false;
      if (filter === "unfinished" && row.status === "paid") return false;
      if (!term) return true;
      return [row.full_name, row.phone, row.email, row.batch_label, row.invoice_number]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, filter, search]);

  const paidCount = rows.filter((r) => r.status === "paid").length;
  const unfinishedCount = rows.length - paidCount;
  const totalCollected = rows
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Enrollments &amp; payments</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
            Students who enrolled and paid online, plus anyone whose payment didn&apos;t go through
            so you can help them finish it.
          </p>
          <p className="mt-2 text-sm text-charcoal">
            <span className="font-bold">{paidCount}</span> paid
            {paidCount > 0 && (
              <span className="text-muted"> · {formatRupees(totalCollected)} collected</span>
            )}
            {unfinishedCount > 0 && (
              <span className="ml-2 font-bold text-red">{unfinishedCount} to follow up</span>
            )}
          </p>
        </div>
        <a href="/api/admin/export?type=enrollments" className="btn-secondary">
          Download as spreadsheet
        </a>
      </header>

      <StatusMessage status={status} />

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All"],
            ["paid", "Paid"],
            ["unfinished", "Needs follow-up"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filter === value
                ? "border-red bg-red text-white"
                : "border-line bg-white text-charcoal hover:border-red/40"
            }`}
          >
            {label}
          </button>
        ))}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, invoice…"
          className="field ml-auto w-full sm:w-64"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-offwhite px-5 py-10 text-center text-sm text-body">
          {rows.length === 0 ? "No online enrollments yet." : "Nothing matches that filter."}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((row) => {
            const meta = STATUS_LABELS[row.status] ?? STATUS_LABELS.abandoned;
            return (
              <li key={row.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-charcoal">{row.full_name}</p>
                      <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{meta.hint}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a href={telHref(row.phone)} className="btn-secondary">
                      Call {row.phone}
                    </a>
                    {row.status !== "paid" && (
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            setStatus(
                              await setLeadContacted("enrollments", row.id, !row.contacted),
                            );
                          })
                        }
                        className={row.contacted ? "btn-ghost text-green-700" : "btn-primary"}
                      >
                        {row.contacted ? "✓ Contacted" : "Mark contacted"}
                      </button>
                    )}
                  </div>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-line pt-3 sm:grid-cols-2">
                  <Row label="Batch" value={row.batch_label} />
                  <Row label="Email" value={row.email} />
                  <Row label="Course fee" value={formatRupees(Number(row.fee_amount))} />
                  <Row
                    label={`GST @ ${Number(row.gst_rate)}%`}
                    value={formatRupees(Number(row.gst_amount))}
                  />
                  <Row label="Total" value={formatRupees(Number(row.total_amount))} />
                  <Row label="Invoice" value={row.invoice_number} />
                  <Row label="Payment reference" value={row.payment_ref} />
                  <Row label="Billing address" value={row.billing_address} />
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <dt className="shrink-0 font-semibold text-muted">{label}:</dt>
      <dd className="min-w-0 break-words text-charcoal">{value}</dd>
    </div>
  );
}
