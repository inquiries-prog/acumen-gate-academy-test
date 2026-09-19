"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import EnquiryForm from "./EnquiryForm";
import type { EnquiryPrefill } from "./SiteUI";

/**
 * General enquiry popup (SRS 8.1).
 *
 * A thin shell around EnquiryForm, which the hero also renders inline. All the
 * field, validation and submit behaviour lives in that one component so the two
 * placements cannot drift apart.
 */
export default function EnquiryModal({
  open,
  source,
  batchLabel,
  prefill,
  onClose,
}: {
  open: boolean;
  source: string;
  batchLabel?: string;
  /** Set when the phone-first hero capture opens this as step two. */
  prefill?: EnquiryPrefill;
  onClose: () => void;
}) {
  // Remounts the form on close, so a reopened popup starts blank rather than
  // showing the previous success screen.
  const [instance, setInstance] = useState(0);

  function handleClose() {
    onClose();
    window.setTimeout(() => setInstance((n) => n + 1), 250);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={prefill?.phone ? "Almost done" : "Enquire Now"}
      subtitle={
        prefill?.phone
          ? `Your name and branch, and we'll call ${prefill.phone} within 24 hours.`
          : batchLabel
            ? `About the ${batchLabel} batch. Leave your details and we'll call you back.`
            : "Leave your details and our team will call you back within 24 hours."
      }
    >
      <EnquiryForm
        key={instance}
        source={source}
        batchLabel={batchLabel}
        initialPhone={prefill?.phone}
        onDone={handleClose}
      />
    </Modal>
  );
}
