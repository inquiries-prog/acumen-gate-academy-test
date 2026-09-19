"use client";

import DemoVideoTile from "@/components/home/DemoVideoTile";
import Modal from "@/components/ui/Modal";
import { calculateFees, formatRupees } from "@/lib/payments";
import type { BatchMode } from "@/lib/types";
import { resolve, whatsappBatchMessage } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppLink from "./WhatsAppLink";

/**
 * "Know about the batch" popup (SRS 7.1.6).
 *
 * Shows mode, start date, duration, faculty and fees, plus the full nine-point
 * pedagogy checklist, and offers exactly two actions: Enroll & Pay Now (SRS 11)
 * and Enquire for this batch (SRS 8.1).
 *
 * Built to read like a product page rather than a fact sheet: the branch's own
 * demo lecture up top, an offline/online switch, and the fee shown the way a
 * student will actually pay it - with GST worked out and a total, not "+ GST".
 * The WhatsApp line under the buttons is a tertiary text link, so the two
 * actions the SRS specifies stay the only buttons.
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
  const { findBranchBatch, pedagogy, push, pop, openEnquiry } = useSiteUI();
  const row = findBranchBatch(branchId, mode);
  if (!row) return null;

  const { branch, batch } = row;
  const modeLabel = mode === "offline" ? "Offline" : "Online";
  const batchLabel = `${branch.name} (${branch.code}) ${modeLabel}`;
  const fees = batch?.fees ?? null;
  const breakdown = fees && fees > 0 ? calculateFees(fees) : null;
  const canEnroll = Boolean(batch?.enroll_enabled && breakdown);

  // The other mode, if this branch runs one - drives the switch.
  const otherMode: BatchMode = mode === "offline" ? "online" : "offline";
  const hasOther = Boolean(findBranchBatch(branchId, otherMode)?.batch?.visible);

  function switchMode(next: BatchMode) {
    if (next === mode) return;
    // Same component at the same stack position, so React batches these into
    // one render and the sheet updates in place without re-animating.
    pop();
    push({ kind: "batchDetail", branchId, mode: next });
  }

  const facts: Array<{ label: string; value: string }> = [
    { label: "Mode", value: modeLabel },
    { label: "Start date", value: resolve(batch?.start_date, "Call us for current dates") },
    { label: "Duration", value: resolve(batch?.duration, "Call us for details") },
    { label: "Faculty", value: resolve(batch?.faculty, "Assigned from our core mentor team") },
    {
      label: "Course fee",
      value: breakdown
        ? `${formatRupees(breakdown.fee)} + ${breakdown.gstRate}% GST`
        : "Call us for current fees",
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
      {batch?.video_id && (
        <DemoVideoTile
          compact
          videoId={batch.video_id}
          start={batch.video_start}
          title={`${branch.name} — demo lecture`}
          caption="Watch a demo lecture"
        />
      )}

      {hasOther && (
        <div
          role="group"
          aria-label="Batch mode"
          className={`grid grid-cols-2 gap-1 rounded-xl border border-line bg-offwhite p-1 ${
            batch?.video_id ? "mt-5" : ""
          }`}
        >
          {(["offline", "online"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={m === mode}
              onClick={() => switchMode(m)}
              className={`min-h-10 rounded-lg text-sm font-semibold transition-all duration-200 ease-smooth ${
                m === mode
                  ? "bg-white text-charcoal shadow-chip"
                  : "text-muted hover:text-charcoal"
              }`}
            >
              {m === "offline" ? "Offline · Vadodara" : "Live online"}
            </button>
          ))}
        </div>
      )}

      <dl
        className={`grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 ${
          batch?.video_id || hasOther ? "mt-5" : ""
        }`}
      >
        {facts.map((f) => (
          <div key={f.label} className="bg-white px-5 py-3.5">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">{f.label}</dt>
            <dd className="mt-1 font-display text-[15px] font-bold text-charcoal">{f.value}</dd>
          </div>
        ))}
        {breakdown && (
          <div className="flex items-center justify-between gap-4 bg-offwhite px-5 py-3.5 sm:col-span-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">Total payable</dt>
              <dd className="mt-0.5 text-xs text-muted">
                includes {formatRupees(breakdown.gst)} GST
              </dd>
            </div>
            <dd className="font-display text-xl font-extrabold text-charcoal">
              {formatRupees(breakdown.total)}
            </dd>
          </div>
        )}
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

      {/* Tertiary, deliberately a text link: SRS 7.1.6 fixes this sheet at two buttons. */}
      <p className="mt-4 text-center text-sm text-body">
        Prefer chat?{" "}
        <WhatsAppLink
          message={whatsappBatchMessage(branch.name, branch.code, mode)}
          className="inline-flex items-center gap-1.5 align-middle font-semibold text-charcoal underline-offset-4 hover:underline"
        >
          <span className="whatsapp-badge h-5 w-5">
            <WhatsAppIcon size={11} />
          </span>
          WhatsApp us about this batch
        </WhatsAppLink>
      </p>
    </Modal>
  );
}
