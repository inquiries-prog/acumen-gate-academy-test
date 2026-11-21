"use client";

import { useState } from "react";
import { useSiteUI } from "@/components/site/SiteUI";
import WhatsAppLink from "@/components/site/WhatsAppLink";
import Reveal from "@/components/ui/Reveal";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { calculateFees } from "@/lib/payments";
import type { Batch, Branch } from "@/lib/types";
import { batchDisplayLabel, formatPrice, isPlaceholder, resolve, whatsappBatchMessage } from "@/lib/utils";

type Filter = "all" | "offline" | "online";

/**
 * Every upcoming batch of a course - this replaces the old offline/online
 * batches popups. Classroom and online batches sit together with a filter,
 * because the question a student is really asking is "which batch suits me",
 * not "which popup do I open".
 *
 * Each batch is a card with the facts that decide it (start date, schedule,
 * duration, language, fee incl. GST) and its actions: Enroll & Pay when online
 * payment is on and a fee is set, otherwise Enquire; plus the free demo, the
 * batch's demo lecture, and WhatsApp.
 */
export default function BatchList({ batches, branch }: { batches: Batch[]; branch: Branch | null }) {
  const { push, openEnquiry, openDemo } = useSiteUI();
  const modes = Array.from(new Set(batches.map((b) => b.mode)));
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? batches : batches.filter((b) => b.mode === filter);
  const branchOption = branch ? `${branch.name} (${branch.code})` : undefined;

  if (batches.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-offwhite px-6 py-12 text-center">
        <p className="font-display text-lg font-bold text-charcoal">New batches are being scheduled</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-body">
          Leave your number and we&apos;ll call you with dates and fees, or sit in on a free demo class first.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button type="button" onClick={() => openDemo("Course page: no batches")} className="btn-primary">
            Book a free demo
          </button>
          <button type="button" onClick={() => openEnquiry("Course page: no batches")} className="btn-secondary">
            Get batch dates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {modes.length > 1 && (
        <div role="group" aria-label="Batch format" className="flex flex-wrap gap-2">
          {(["all", "offline", "online"] as const).map((f) => {
            const count = f === "all" ? batches.length : batches.filter((b) => b.mode === f).length;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all duration-300 ease-smooth active:scale-95 ${
                  filter === f
                    ? "border-charcoal bg-charcoal text-white shadow-lifted"
                    : "border-line bg-white text-charcoal hover:border-red/40"
                }`}
              >
                {f === "all" ? "All batches" : f === "offline" ? "Classroom · Vadodara" : "Live online"}
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] ${
                    filter === f ? "bg-white/20" : "bg-offwhite text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div key={filter} className="mt-6 grid gap-4 lg:grid-cols-2">
        {shown.map((batch, i) => {
          const label = batchDisplayLabel(batch, branch);
          const breakdown = batch.fees && batch.fees > 0 ? calculateFees(Number(batch.fees)) : null;
          const canEnroll = Boolean(batch.enroll_enabled && breakdown);
          const title = batch.title || (batch.mode === "offline" ? "Classroom batch" : "Live online batch");
          const facts = [
            { k: "Starts", v: isPlaceholder(batch.start_date) ? "Call for dates" : resolve(batch.start_date, "Call for dates") },
            { k: "Schedule", v: batch.schedule || "Shared on enquiry" },
            { k: "Duration", v: resolve(batch.duration, "Call us") },
            { k: "Language", v: batch.medium || "English + Hindi" },
          ];

          return (
            <Reveal key={batch.id} delay={(i % 2) * 90} distance="lg" className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-red/25 hover:shadow-card-hover">
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1 ${batch.mode === "offline" ? "bg-red-sheen" : "bg-charcoal"}`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      batch.mode === "offline" ? "bg-red/[0.08] text-red" : "bg-charcoal text-white"
                    }`}
                  >
                    {batch.mode === "offline" ? "Classroom" : "Live online"}
                  </span>
                  {batch.badge && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-900">
                      {batch.badge}
                    </span>
                  )}
                  {batch.seats && (
                    <span className="ml-auto text-xs font-semibold text-muted">Batch size: {batch.seats}</span>
                  )}
                </div>

                <h3 className="mt-3 text-xl">{title}</h3>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  {facts.map((f) => (
                    <div key={f.k}>
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">{f.k}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-charcoal">{f.v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-end justify-between gap-4 rounded-2xl bg-offwhite px-4 py-3.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Course fee</p>
                    <p className="font-display text-2xl font-extrabold text-charcoal">
                      {breakdown ? formatPrice(breakdown.total) : "Ask us"}
                    </p>
                  </div>
                  {breakdown && (
                    <p className="text-right text-xs leading-snug text-muted">
                      incl. {breakdown.gstRate}% GST
                      <br />
                      ({formatPrice(breakdown.gst)})
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {canEnroll ? (
                    <button
                      type="button"
                      onClick={() => push({ kind: "enroll", batchId: batch.id })}
                      className="btn-primary"
                    >
                      Enroll &amp; Pay
                    </button>
                  ) : (
                    <button type="button" onClick={() => openEnquiry("Course page batch", label)} className="btn-primary">
                      Enquire for this batch
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      openDemo(`Course page batch: ${label}`, {
                        branch: branchOption,
                        mode: batch.mode === "online" ? "Online" : "Offline at Vadodara",
                      })
                    }
                    className="btn-secondary"
                  >
                    🎓 Free demo first
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {canEnroll && (
                    <button
                      type="button"
                      onClick={() => openEnquiry("Course page batch", label)}
                      className="font-semibold text-charcoal underline-offset-4 hover:text-red hover:underline"
                    >
                      Ask a question
                    </button>
                  )}
                  {batch.video_id && (
                    <button
                      type="button"
                      onClick={() =>
                        push({ kind: "video", videoId: batch.video_id, start: batch.video_start, title: `${title} - demo lecture` })
                      }
                      className="inline-flex items-center gap-1.5 font-semibold text-charcoal underline-offset-4 hover:text-red hover:underline"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-red text-white">
                        <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
                          <path d="M2 1l7 4-7 4z" fill="currentColor" />
                        </svg>
                      </span>
                      Watch demo lecture
                    </button>
                  )}
                  {branch && (
                    <WhatsAppLink
                      message={whatsappBatchMessage(branch.name, branch.code, batch.mode)}
                      className="inline-flex items-center gap-1.5 font-semibold text-charcoal underline-offset-4 hover:underline"
                    >
                      <span className="whatsapp-badge h-5 w-5">
                        <WhatsAppIcon size={11} />
                      </span>
                      WhatsApp
                    </WhatsAppLink>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
