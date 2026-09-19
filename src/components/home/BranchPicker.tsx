"use client";

import { useSiteUI } from "@/components/site/SiteUI";

/**
 * "Jump to your branch" - six chips that open the batch sheet for that branch.
 *
 * Before this, the only route to a specific branch was Courses card -> batches
 * popup -> scroll -> "Know about the batch". A student knows their branch the
 * moment they land; this lets them act on it in one tap. Offline is the lead
 * product, so the chip opens the offline batch; the sheet itself offers the
 * online switch, and the footer line here goes straight to online batches.
 *
 * Branch data comes from the same provider the popups use, so the chips are
 * always the branches the admin has marked visible.
 */
export default function BranchPicker() {
  const { offline, push } = useSiteUI();
  const rows = offline.filter((row) => row.branch.visible);

  if (rows.length === 0) return null;

  return (
    <div className="min-w-0 lg:flex lg:h-full lg:flex-col lg:rounded-2xl lg:border lg:border-line lg:bg-offwhite lg:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
        Jump to your branch
      </p>

      {/* Phone: a bleed scroll row. Desktop: a two-column list in a panel. */}
      <ul
        className="mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar max-sm:edge-fade-x
                   sm:mx-0 sm:flex-wrap sm:px-0
                   lg:grid lg:grid-cols-2 lg:gap-2.5"
      >
        {rows.map(({ branch }) => (
          <li key={branch.id} className="shrink-0 lg:min-w-0">
            <button
              type="button"
              data-branch={branch.code}
              onClick={() => push({ kind: "batchDetail", branchId: branch.id, mode: "offline" })}
              className="chip group/chip gap-2.5 whitespace-nowrap px-3.5 py-2.5 text-[13px]
                         transition-all duration-300 ease-smooth
                         hover:-translate-y-0.5 hover:border-red/40 hover:shadow-card
                         active:scale-[0.97]
                         lg:w-full lg:justify-start lg:rounded-xl lg:px-4 lg:py-3"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-red/[0.08] font-display text-[11px] font-extrabold text-red transition-colors duration-300 group-hover/chip:bg-red group-hover/chip:text-white">
                {branch.code}
              </span>
              <span className="truncate">{branch.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-muted lg:mt-auto lg:pt-5">
        Opens the Vadodara offline batch.{" "}
        <button
          type="button"
          onClick={() => push({ kind: "batches", mode: "online" })}
          className="font-semibold text-red underline-offset-4 hover:underline"
        >
          Online instead? See online batches
        </button>
      </p>
    </div>
  );
}
