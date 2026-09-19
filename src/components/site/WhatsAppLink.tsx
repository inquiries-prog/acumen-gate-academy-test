import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/defaults";
import { whatsappHref } from "@/lib/utils";

/**
 * The one place that knows the WhatsApp number.
 *
 * WhatsApp is how most students in this audience actually reach an institute,
 * so it sits beside "Call" everywhere Call appears. It is a plain link - no
 * script, no widget, nothing to load - and opens the chat with a pre-written
 * opening line so the student never faces a blank box.
 */
export default function WhatsAppLink({
  message = WHATSAPP_DEFAULT_MESSAGE,
  className = "",
  ariaLabel,
  children,
}: {
  message?: string;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={whatsappHref(WHATSAPP_NUMBER, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}
