import Reveal from "./Reveal";

/**
 * One section header treatment for the whole site.
 *
 * Centralised so section rhythm stays identical everywhere - the thing that
 * most often makes a page feel "templated" is each section inventing its own
 * heading spacing.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "light",
  action,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Optional trailing control, e.g. a "view all" link on desktop. */
  action?: React.ReactNode;
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-wrap items-end gap-6 ${
        centered ? "justify-center text-center" : "justify-between"
      } ${className}`}
    >
      <Reveal className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={centered ? "eyebrow mx-auto" : "eyebrow"}>
            <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2
          className={`h-section mt-5 ${tone === "dark" ? "text-white" : "text-charcoal"}`}
        >
          {title}
        </h2>
        {lede && (
          <p
            className={`mt-4 text-[15px] leading-relaxed sm:text-base ${
              tone === "dark" ? "text-white/65" : "text-body"
            }`}
          >
            {lede}
          </p>
        )}
      </Reveal>

      {action && <Reveal delay={80}>{action}</Reveal>}
    </div>
  );
}
