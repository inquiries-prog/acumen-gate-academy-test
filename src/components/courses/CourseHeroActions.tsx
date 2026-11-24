"use client";

import { useSiteUI } from "@/components/site/SiteUI";
import WhatsAppLink from "@/components/site/WhatsAppLink";
import Reveal from "@/components/ui/Reveal";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import GateCountdown from "./GateCountdown";
import { SyllabusDownloadLink } from "./SyllabusDownload";

/** Course page hero: the live countdown and the secondary contact actions. */
export default function CourseHeroActions({
  courseTitle,
  branchOption,
  syllabusUrl = "",
  showCountdown = true,
  syllabusLabel,
}: {
  courseTitle: string;
  branchOption?: string;
  syllabusUrl?: string;
  /** The GATE countdown; off for non-GATE courses. */
  showCountdown?: boolean;
  syllabusLabel?: string;
}) {
  const { settings, openEnquiry } = useSiteUI();
  return (
    <Reveal delay={200} className="mt-8">
      {showCountdown && <GateCountdown date={settings.gate_exam_date} label={settings.gate_exam_label} tone="dark" />}
      <div className={`${showCountdown ? "mt-6" : ""} flex flex-wrap gap-x-6 gap-y-3 text-sm`}>
        <WhatsAppLink
          message={`Hi, I'd like to know more about the ${courseTitle} course.`}
          className="inline-flex items-center gap-2 font-semibold text-white/90 hover:text-white"
        >
          <span className="whatsapp-badge h-7 w-7">
            <WhatsAppIcon size={14} />
          </span>
          Ask on WhatsApp
        </WhatsAppLink>
        <button
          type="button"
          onClick={() => openEnquiry(`Course hero: ${courseTitle}`, branchOption)}
          className="inline-flex items-center gap-2 font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
        >
          Request a callback
        </button>
        <SyllabusDownloadLink url={syllabusUrl} label={syllabusLabel} className="text-white/90 hover:text-white" />
      </div>
    </Reveal>
  );
}
