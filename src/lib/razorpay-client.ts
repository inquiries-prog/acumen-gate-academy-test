"use client";

/**
 * Loads Razorpay's Checkout script once per page session.
 *
 * Shared by the enroll sheet - which starts the download the moment a student
 * opens it, while they are still typing - and the checkout page, which then
 * finds `window.Razorpay` already there and opens the payment window at once
 * instead of waiting on a fresh download.
 */
export const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    const script = existing ?? document.createElement("script");
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error("script failed")), { once: true });
    if (!existing) {
      script.src = CHECKOUT_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

/** Fire-and-forget warm-up: never throws, never blocks. */
export function preloadCheckoutScript() {
  loadCheckoutScript().catch(() => {
    /* the checkout page retries and reports the problem itself */
  });
}
