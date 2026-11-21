import type { CSSProperties } from "react";

/*
 * Plain helpers (not a client module), so server-rendered illustrations can
 * use them too. See LineArt.tsx and the .la rules in globals.css.
 */

/** Props for a stroke that draws itself, starting `delay` seconds in. */
export function draw(delay = 0, extraClass = "") {
  return {
    pathLength: 1,
    className: `la-d ${extraClass}`,
    style: { "--d": `${delay}s` } as CSSProperties,
  };
}

/** Props for an accent that pops in, `delay` seconds in. */
export function pop(delay = 0, extraClass = "") {
  return {
    className: `la-f ${extraClass}`,
    style: { "--d": `${delay}s` } as CSSProperties,
  };
}
