import type { Config } from "tailwindcss";

/**
 * Design tokens.
 *
 * The palette is locked to SRS 3.1 - do not introduce colours outside that
 * table. Depth, type scale and motion below are the expressive layer: they add
 * polish without touching the brand colours.
 *
 * Shadows are deliberately warm (tinted with the charcoal, never neutral black)
 * and layered, which is what stops cards reading as flat HTML boxes.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: {
    // Wraps every hover: utility in @media (hover: hover). Without this, a tap
    // on a touch screen leaves the element in its hover state until the next
    // tap elsewhere - cards stay lifted, the carousel row stays dimmed.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        offwhite: "#FBF9F8",
        red: { DEFAULT: "#E31E24", dark: "#A32D2D" },
        charcoal: "#231F20",
        body: "#5A5A5A",
        muted: "#767671",
        line: "#EDEBE9",
        // WhatsApp's brand green. The one colour outside the SRS 3.1 palette,
        // permitted on the same basis as the amber Google stars: it is another
        // company's mark, and a green WhatsApp badge is recognised instantly
        // where a red one reads as just another button. Used only on the
        // WhatsApp control - never as a general accent.
        whatsapp: { DEFAULT: "#25D366", dark: "#1DA851" },
      },
      fontFamily: {
        // Display face for headings, text face for everything else.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        // Tighter tracking as type gets larger, the way display type should set.
        "display-xl": ["clamp(2.5rem, 6vw, 4.25rem)", { lineHeight: "1.04", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.1rem, 4.6vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem, 3.4vw, 2.5rem)", { lineHeight: "1.14", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.45rem, 2.4vw, 1.9rem)", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      maxWidth: { site: "1240px" },
      boxShadow: {
        card: "0 1px 2px rgba(35,31,32,0.04), 0 4px 16px -6px rgba(35,31,32,0.08)",
        "card-hover": "0 2px 4px rgba(35,31,32,0.05), 0 18px 40px -14px rgba(35,31,32,0.18)",
        lifted: "0 20px 55px -20px rgba(35,31,32,0.28)",
        "red-glow": "0 10px 30px -10px rgba(227,30,36,0.45)",
        "whatsapp-glow": "0 8px 22px -6px rgba(37,211,102,0.55)",
        chip: "0 1px 2px rgba(35,31,32,0.06)",
      },
      backgroundImage: {
        // Warm brand wash, built only from the palette red.
        "hero-wash":
          "radial-gradient(58% 62% at 82% 6%, rgba(227,30,36,0.10), transparent 62%), radial-gradient(46% 52% at 6% 96%, rgba(227,30,36,0.06), transparent 60%)",
        "red-sheen": "linear-gradient(135deg, #E31E24 0%, #A32D2D 100%)",
        /* Gradients ONLY. A bare colour here is not a valid background-image
           value and makes the browser drop the whole declaration, so every
           user of this pairs it with `bg-charcoal` for the ground colour. */
        "dark-sheen":
          "radial-gradient(70% 120% at 12% 0%, rgba(227,30,36,0.22), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        // Same travel, opposite direction, for the counter-scrolling second row.
        marqueeReverse: {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        /* Ambient glow drifts. Transform + opacity only, so the compositor can
           run them on the GPU without re-rasterising anything - the reason the
           blobs are soft radial gradients rather than blur-filtered boxes. */
        glowA: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.85" },
          "50%": { transform: "translate3d(8%,-6%,0) scale(1.18)", opacity: "1" },
        },
        glowB: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1.08)", opacity: "0.7" },
          "50%": { transform: "translate3d(-9%,7%,0) scale(0.92)", opacity: "1" },
        },
        glowC: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(0.95)", opacity: "0.6" },
          "50%": { transform: "translate3d(5%,9%,0) scale(1.15)", opacity: "0.9" },
        },
        /* Slow sweep of a conic highlight around a panel edge. */
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        /* Bottom sheet rising from below the viewport (phones). */
        sheetUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        /* Full-screen mobile menu entering from the right. */
        slideInRight: {
          from: { opacity: "0", transform: "translateX(6%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        /* Success moment: the tick draws itself, the circle pops, particles
           burst outward. Dash-offset and transform only - no layout. */
        drawCheck: {
          from: { strokeDashoffset: "36" },
          to: { strokeDashoffset: "0" },
        },
        pop: {
          "0%": { transform: "scale(.4)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        burst: {
          "0%": { transform: "translateX(0) scale(1)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "translateX(var(--dist, 52px)) scale(.2)", opacity: "0" },
        },
        /* Soft ring expanding behind a play button. */
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: ".45" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        /* The arrow in a "swipe" cue, beckoning sideways. */
        nudgeX: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        // Slow + continuous per SRS 7.1.2 - the client explicitly asked for this
        // to be slowed down from a faster earlier version.
        // Slow + continuous per SRS 7.1.2. The two rows run at different speeds
        // so they never line up, which is what stops it looking mechanical.
        marquee: "marquee 90s linear infinite",
        "marquee-slow": "marquee 115s linear infinite",
        "marquee-reverse": "marqueeReverse 145s linear infinite",
        fadeIn: "fadeIn .18s ease-out",
        slideUp: "slideUp .22s cubic-bezier(0.16,1,0.3,1)",
        reveal: "reveal .5s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 7s ease-in-out infinite",
        // Deliberately mismatched durations (prime-ish, no common factor) so the
        // three blobs never resynchronise and the motion reads as organic.
        "glow-a": "glowA 19s ease-in-out infinite",
        "glow-b": "glowB 23s ease-in-out infinite",
        "glow-c": "glowC 29s ease-in-out infinite",
        "spin-slow": "spinSlow 14s linear infinite",
        // `both` fill-mode matters for these: menu items carry a staggered
        // animation-delay and must stay invisible until their turn.
        sheetUp: "sheetUp .32s cubic-bezier(0.16,1,0.3,1) both",
        slideInRight: "slideInRight .32s cubic-bezier(0.16,1,0.3,1) both",
        "draw-check": "drawCheck .45s cubic-bezier(0.16,1,0.3,1) .25s both",
        pop: "pop .5s cubic-bezier(0.16,1,0.3,1) both",
        burst: "burst .7s cubic-bezier(0.16,1,0.3,1) .2s both",
        "pulse-ring": "pulseRing 2.2s cubic-bezier(0.16,1,0.3,1) infinite",
        "nudge-x": "nudgeX 1.4s ease-in-out infinite",
      },
      transitionTimingFunction: {
        // Decelerating curve - motion that settles rather than stops dead.
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
