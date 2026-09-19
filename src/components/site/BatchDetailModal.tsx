"use client";

import Modal from "@/components/ui/Modal";
import { formatRupees } from "@/lib/payments";
import type { BatchMode } from "@/lib/types";
import { resolve } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";

/**
 * "Know about the batch" popup (SRS 7.1.6).
 *
 * Shows mode, start date, duration, faculty and fees, plus the full nine-point
 * pedagogy checklist, and offers exactly two actions: Enroll & Pay Now (SRS 11)
 * and Enquire for this batch (SRS 8.1).
 */
export default function BatchDetailModal({
  open,
  branchId,
  mode,
  onClose,
}: {
  open: boolean;
  branchId: string;
  mode: BatchMode;
  onClose: () => void;
}) {
  const { findBranchBatch, pedagogy, push, openEnquiry } = useSiteUI();
  const row = findBranchBatch(branchId, mode);
  if (!row) return null;

  const { branch, batch } = row;
  const modeLabel = mode === "offline" ? "Offline" : "Online";
  const batchLabel = `${branch.name} (${branch.code}) ${modeLabel}`;
  const fees = batch?.fees ?? null;
  const canEnroll = Boolean(batch?.enroll_enabled && fees && fees > 0);

  const facts: Array<{ label: string; value: string }> = [
    { label: "Mode", value: modeLabel },
    { label: "Start date", value: resolve(batch?.start_date, "Call us for current dates") },
    { label: "Duration", value: resolve(batch?.duration, "Call us for details") },
    { label: "Faculty", value: resolve(batch?.faculty, "Assigned from our core mentor team") },
    {
      label: "Fees",
      value: fees ? `${formatRupees(fees)} + GST` : "Call us for current fees",
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`${branch.name} — ${modeLabel} Batch`}
      subtitle={`GATE coaching for ${branch.code} students, ${
        mode === "offline" ? "at our Vadodara centre" : "live online"
      }.`}
    >
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="bg-white px-5 py-3.5">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">{f.label}</dt>
            <dd className="mt-1 font-display text-[15px] font-bold text-charcoal">{f.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-7 font-display text-lg font-bold">What this batch includes</h3>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {pedagogy.map((p) => (
          <li key={p.id} className="flex items-start gap-2.5 text-sm leading-relaxed text-body">
            <svg
              width="17"
              height="17"
              viewBox="0 0 20 20"
              fill="none"
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="9" fill="#E31E24" fillOpacity="0.1" />
              <path
                d="M6 10.2l2.6 2.6L14 7.4"
                stroke="#E31E24"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{p.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5 sm:flex-row">
        {canEnroll && (
          <button
            type="button"
            onClick={() => push({ kind: "enroll", branchId, mode })}
            className="btn-primary flex-1"
          >
            Enroll &amp; Pay Now
          </button>
        )}
        <button
          type="button"
          onClick={() => openEnquiry("Batch detail popup", batchLabel)}
          className={canEnroll ? "btn-secondary flex-1" : "btn-primary flex-1"}
        >
          Enquire for this batch
        </button>
      </div>
    </Modal>
  );
}
