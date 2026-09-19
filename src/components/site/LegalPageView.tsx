import { PHONE_DISPLAY } from "@/lib/defaults";
import { telHref, toParagraphs } from "@/lib/utils";

/**
 * Privacy Policy / Terms & Conditions.
 *
 * The copy for both is pending from the client and is REQUIRED before launch,
 * because online payment is live from day one (SRS 12). Until it is supplied
 * the page states plainly that it is being finalised rather than showing
 * invented legal text - which would be worse than showing nothing.
 *
 * Both pages are admin-editable; once the client pastes the real copy it
 * replaces this notice with no code change.
 */
export default function LegalPageView({ title, content }: { title: string; content: string }) {
  const paragraphs = toParagraphs(content);

  return (
    <div className="container-site max-w-3xl py-14 md:py-20">
      <h1 className="text-display-lg">{title}</h1>

      {paragraphs.length > 0 ? (
        <div className="mt-6 space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-body sm:text-base">
              {p}
            </p>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-line bg-offwhite p-6">
          <p className="text-[15px] leading-relaxed text-body">
            We&apos;re finalising this page. If you have a question about how we handle your
            information or about enrolling with us, please call us on{" "}
            <a href={telHref(PHONE_DISPLAY)} className="font-bold text-red hover:underline">
              {PHONE_DISPLAY}
            </a>{" "}
            and we&apos;ll answer directly.
          </p>
        </div>
      )}
    </div>
  );
}
