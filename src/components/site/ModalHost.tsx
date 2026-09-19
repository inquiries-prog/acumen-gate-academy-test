"use client";

import BatchDetailModal from "./BatchDetailModal";
import BatchesModal from "./BatchesModal";
import EnquiryModal from "./EnquiryModal";
import EnrollModal from "./EnrollModal";
import LightboxModal from "./LightboxModal";
import SeminarModal from "./SeminarModal";
import VideoModal from "./VideoModal";
import { useSiteUI } from "./SiteUI";

/**
 * Renders whichever popup is on top of the stack. Mounted once in the root
 * layout, above the routed page content, so every popup on the site survives
 * navigation (SRS 7.1.2).
 *
 * Closing pops one level rather than clearing the stack, so a visitor who opened
 * a batch detail from the batches list lands back on the list, not on nothing.
 */
export default function ModalHost() {
  const { current, pop } = useSiteUI();
  if (!current) return null;

  switch (current.kind) {
    case "enquiry":
      return (
        <EnquiryModal
          open
          source={current.source}
          batchLabel={current.batchLabel}
          prefill={current.prefill}
          onClose={pop}
        />
      );
    case "seminar":
      return <SeminarModal open onClose={pop} />;
    case "batches":
      return <BatchesModal open mode={current.mode} onClose={pop} />;
    case "batchDetail":
      return <BatchDetailModal open branchId={current.branchId} mode={current.mode} onClose={pop} />;
    case "enroll":
      return <EnrollModal open branchId={current.branchId} mode={current.mode} onClose={pop} />;
    case "video":
      return (
        <VideoModal
          open
          videoId={current.videoId}
          start={current.start}
          title={current.title}
          onClose={pop}
        />
      );
    case "lightbox":
      return <LightboxModal open images={current.images} index={current.index} onClose={pop} />;
    default:
      return null;
  }
}
