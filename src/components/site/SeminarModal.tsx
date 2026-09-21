"use client";

import { useState } from "react";
import { displayPhone } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import SuccessBurst from "@/components/ui/SuccessBurst";
import { useSiteUI } from "./SiteUI";

/**
 * Seminar-attendee popup (SRS 8.2).
 *
 * A separate lead list from general enquiries - the client follows the two up
 * differently, so they are never merged (SRS 10). On submit the college-specific
 * offer is revealed, which is configured per university in the admin panel.
 */
export default function SeminarModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { formOptions, universities, settings } = useSiteUI();
  const [submitting, setSubmitting] = useState(false);
  const [offer, setOffer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const branches = formOptions.branch ?? [];
  const interestedFor = formOptions.interested_for ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/seminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fd.get("full_name"),
          mobile: fd.get("mobile"),
          branch: fd.get("branch"),
          university: fd.get("university"),
          city: fd.get("city"),
          interested_for: fd.get("interested_for"),
          company: fd.get("company"),
        }),
      });
      const body = (await res.json()) as { ok: boolean; offer?: string; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong.");
      setOffer(body.offer ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't submit that just now. Please call us instead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    window.setTimeout(() => {
      setOffer(null);
      setError(null);
    }, 250);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={offer === null ? "Great that you have attended the seminar!" : undefined}
      subtitle={offer === null ? "Can you help us with some more information?" : undefined}
    >
      {offer !== null ? (
        <div className="py-3 text-center">
          <SuccessBurst variant="gift" />
          <h2 className="font-display text-xl font-bold animate-reveal" style={{ animationDelay: "250ms" }}>
            Here&apos;s your exclusive offer
          </h2>
          <div
            className="mt-4 rounded-xl border border-red/25 bg-red/5 px-5 py-4 text-left animate-reveal"
            style={{ animationDelay: "350ms" }}
          >
            <p className="text-[15px] leading-relaxed text-charcoal">{offer}</p>
          </div>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn-primary">
              Call {displayPhone(settings.phone)}
            </a>
            <button type="button" onClick={handleClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <div>
            <label htmlFor="sem-name" className="field-label">
              Name <span className="text-red">*</span>
            </label>
            <input
              id="sem-name"
              name="full_name"
              required
              autoComplete="name"
              className="field"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="sem-mobile" className="field-label">
              Mobile <span className="text-red">*</span>
            </label>
            <input
              id="sem-mobile"
              name="mobile"
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9+\s-]{10,15}"
              autoComplete="tel"
              className="field"
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sem-branch" className="field-label">
                Branch <span className="text-red">*</span>
              </label>
              <select id="sem-branch" name="branch" required defaultValue="" className="field">
                <option value="" disabled>
                  Select branch
                </option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sem-city" className="field-label">
                Residential City <span className="text-red">*</span>
              </label>
              <input
                id="sem-city"
                name="city"
                required
                autoComplete="address-level2"
                className="field"
                placeholder="e.g. Vadodara"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sem-uni" className="field-label">
              University <span className="text-red">*</span>
            </label>
            {/* Drives which offer is revealed, so it is a list, not free text. */}
            <select id="sem-uni" name="university" required defaultValue="" className="field">
              <option value="" disabled>
                Where did you attend the seminar?
              </option>
              {universities.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sem-interested" className="field-label">
              Interested For <span className="text-red">*</span>
            </label>
            <select
              id="sem-interested"
              name="interested_for"
              required
              defaultValue=""
              className="field"
            >
              <option value="" disabled>
                Select an option
              </option>
              {interestedFor.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Checking…" : "Show my offer"}
          </button>
        </form>
      )}
    </Modal>
  );
}
