"use client";

import Modal from "@/components/ui/Modal";
import { PLACEHOLDER } from "@/lib/defaults";
import type { BatchMode, BranchBatch } from "@/lib/types";
import { useSiteUI } from "./SiteUI";

/**
 * Batches & branches modal (SRS 7.1.6).
 *
 * Large and spacious, never cramped, listing all six branches. On desktop each
 * branch is a row with its actions on the right; on mobile the row becomes a
 * stacked card with full-width buttons, so nothing clips or scrolls sideways
 * (SRS 3.4 calls this modal out by name as needing mobile verification).
 *
 * "Download the App" is deliberately NOT rendered - not even disabled (SRS 8.4).
 * The actions below are built as a list precisely so a fourth entry can be
 * added later without reworking the layout.
 */
export default function BatchesModal({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: BatchMode;
  onClose: () => void;
}) {
  const { batchesFor } = useSiteUI();
  const rows = batchesFor(mode);
  const label = mode === "offline" ? "Offline" : "Online";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={`${label} GATE Batches`}
      subtitle="Choose your branch to see batch details, watch a demo lecture, or talk to our team."
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <BranchRow key={row.branch.id} row={row} mode={mode} />
        ))}
      </div>

      <p className="mt-5 border-t border-line pt-4 text-center text-sm text-body">
        Not sure which batch fits you?{" "}
        <EnquireInline label="Talk to a counsellor" mode={mode} />
      </p>
    </Modal>
  );
}

function BranchRow({ row, mode }: { row: BranchBatch; mode: BatchMode }) {
  const { push, openEnquiry } = useSiteUI();
  const { branch, batch } = row;
  const batchLabel = `${branch.name} (${branch.code}) ${mode === "offline" ? "Offline" : "Online"}`;

  const startDate =
    !batch || !batch.start_date || batch.start_date === PLACEHOLDER
      ? "Starting soon — call for dates"
      : batch.start_date;

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-chip
                 transition-all duration-300 ease-smooth hover:border-red/25 hover:shadow-card
                 md:flex-row md:items-center md:justify-between md:gap-5"
    >
      <div className="min-w-0 md:flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-[17px] font-bold leading-snug">{branch.name}</h3>
          <span className="rounded-md bg-red/[0.08] px-2 py-0.5 text-[11px] font-bold text-red">
            {branch.code}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-body">
          <span className="font-medium text-charcoal">
            {mode === "offline" ? "Offline" : "Online"}
          </span>
          <span aria-hidden="true" className="text-line">
            •
          </span>
          <span>Starts: {startDate}</span>
        </p>
      </div>

      {/* Full-width stacked on mobile, inline from md up. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:shrink-0 md:gap-2">
        <button
          type="button"
          onClick={() => openEnquiry("Batches modal", batchLabel)}
          className="btn-primary btn-sm w-full md:w-auto"
        >
          Enquire Now
        </button>
        <button
          type="button"
          onClick={() => push({ kind: "batchDetail", branchId: branch.id, mode })}
          className="btn-secondary btn-sm w-full md:w-auto"
        >
          Know about the batch
        </button>
        <button
          type="button"
          disabled={!batch?.video_id}
          onClick={() =>
            batch?.video_id &&
            push({
              kind: "video",
              videoId: batch.video_id,
              start: batch.video_start,
              title: `${branch.name} — demo lecture`,
            })
          }
          className="btn-secondary btn-sm w-full md:w-auto"
        >
          Watch Demo
        </button>
      </div>
    </div>
  );
}

function EnquireInline({ label, mode }: { label: string; mode: BatchMode }) {
  const { openEnquiry } = useSiteUI();
  return (
    <button
      type="button"
      onClick={() => openEnquiry(`Batches modal (${mode})`)}
      className="font-semibold text-red underline-offset-4 hover:underline"
    >
      {label}
    </button>
  );
}
