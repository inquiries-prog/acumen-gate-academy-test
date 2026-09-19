"use client";

import { useSiteUI } from "@/components/site/SiteUI";

/**
 * "Jump to your branch" - six tiles that open the batch sheet for that branch.
 *
 * Before this, the only route to a specific branch was Courses card -> batches
 * popup -> scroll -> "Know about the batch". A student knows their branch the
 * moment they land; this lets them act on it in one tap. Offline is the lead
 * product, so a tile opens the offline batch; the sheet itself offers the
 * online switch, and the footer line here goes straight to online batches.
 *
 * Every branch is visible at every size. On phones that means a 3 x 2 grid of
 * tiles (code large, name beneath) - an earlier version was a sideways scroll
 * row, and nobody could tell there were more branches off-screen. From `lg`
 * the same tiles flatten into a two-column list inside a panel beside the
 * demo video.
 *
 * The tiles cascade in as the block reveals: the wrapping `Reveal` adds
 * `opacity-100` when it enters the viewport, and each tile transitions from
 * that class with its own delay. Transform and opacity only.
 *
 * Branch data comes from the same provider the popups use, so the tiles are
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

      <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6 lg:grid-cols-2">
        {rows.map(({ branch }, i) => (
          <li
            key={branch.id}
            className="min-w-0 translate-y-3 opacity-0 transition-[transform,opacity] duration-500 ease-smooth
                       group-[.opacity-100]/picker:translate-y-0 group-[.opacity-100]/picker:opacity-100"
            style={{ transitionDelay: `${i * 55}ms` }}
          >
            <button
              type="button"
              data-branch={branch.code}
              onClick={() => push({ kind: "batchDetail", branchId: branch.id, mode: "offline" })}
              className="group/tile relative flex h-full w-full flex-col items-start gap-1.5 overflow-hidden
                         rounded-xl border border-line bg-white p-3 text-left shadow-chip
                         transition-all duration-300 ease-smooth
                         hover:-translate-y-0.5 hover:border-red/40 hover:shadow-card active:scale-[0.97]
                         lg:flex-row lg:items-center lg:gap-2.5 lg:px-4 lg:py-3"
            >
              {/* A red corner wash that grows on press/hover - the tile's "lit" state. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-red/[0.07]
                           transition-transform duration-500 ease-smooth group-hover/tile:scale-[2.2] group-active/tile:scale-[2.2]"
              />
              <span
                className="relative grid h-8 min-w-8 shrink-0 place-items-center rounded-lg bg-red/[0.08] px-1.5
                           font-display text-sm font-extrabold text-red transition-colors duration-300
                           group-hover/tile:bg-red group-hover/tile:text-white
                           lg:h-7 lg:min-w-7 lg:text-[11px]"
              >
                {branch.code}
              </span>
              <span className="relative text-[11.5px] font-semibold leading-tight text-charcoal lg:truncate lg:text-[13px]">
                {branch.name}
              </span>
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
