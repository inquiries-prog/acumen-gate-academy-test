#!/usr/bin/env node
/**
 * Screenshots every public route at phone and desktop sizes.
 *
 *   npm run shots            # against an already-running server (default :3000)
 *   npm run shots:start      # builds nothing; starts `next start`, shoots, stops it
 *
 * Options:
 *   --url <base>      default http://localhost:3000
 *   --start           spawn `npm run start` first (requires a prior `npm run build`)
 *   --routes <csv>    default /,/about,/results,/news,/privacy,/terms
 *   --out <dir>       default ./screenshots
 *
 * Why this exists: SRS 3.4 makes a ~390px check the acceptance bar for every
 * feature, and until now nothing in this project could produce one. This is
 * the first time mobile can be looked at rather than inferred from CSS.
 *
 * Per route it scrolls the page through in steps before capturing, because
 * `Reveal` only shows content once it intersects - a bare fullPage shot would
 * show every below-fold section blank. On the homepage it also captures the
 * enquiry bottom sheet (with the quick-capture number prefilled), the mobile
 * menu, a card rail, and the sticky bar over the footer.
 *
 * It never submits a form. Dev-only; Playwright is a devDependency.
 *
 * Build with `rm -rf .next && npm run build` (or `npm run build:clean`) before
 * running. Turbopack's incremental build reuses prerendered pages, so a page
 * captured after adding metadata files or changing a layout can be stale.
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const BASE = args.url ?? "http://localhost:3000";
const OUT = args.out ?? "./screenshots";
const ROUTES = (args.routes ?? "/,/about,/results,/news,/privacy,/terms").split(",");

const DEVICES = {
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--start") out.start = true;
    else if (a.startsWith("--")) out[a.slice(2)] = argv[++i];
  }
  return out;
}

const slugOf = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-"));

/**
 * The identity assets are file-convention routes generated at build time. If
 * one is missing, a shared link shows no preview card and the home-screen icon
 * is a blank tile - worth failing loudly over.
 */
const ASSET_CHECKS = [
  ["/icon/32", "image/png"],
  ["/icon/512", "image/png"],
  ["/apple-icon", "image/png"],
  ["/opengraph-image", "image/png"],
  ["/twitter-image", "image/png"],
  ["/manifest.webmanifest", "application/manifest+json"],
];

async function checkAssets() {
  console.log("\n== identity assets ==");
  for (const [path, type] of ASSET_CHECKS) {
    let verdict;
    try {
      const res = await fetch(BASE + path);
      const ct = res.headers.get("content-type") ?? "";
      verdict = res.ok && ct.startsWith(type) ? "PASS" : `FAIL (${res.status} ${ct})`;
    } catch (err) {
      verdict = `FAIL (${err.message})`;
    }
    if (verdict !== "PASS") process.exitCode = 1;
    console.log(`  ${verdict.padEnd(6)} ${path}`);
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs / 1000}s`);
}

/**
 * Scrolls the page through so every Reveal has fired, then returns to top.
 *
 * The site sets `scroll-behavior: smooth`, which turns every scrollTo into an
 * animation - a screenshot taken 600ms after "scroll to top" was landing
 * mid-flight. Smooth scrolling is switched off for the capture, and the
 * return-to-top is confirmed rather than assumed.
 */
async function scrollThrough(page) {
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await page.evaluate(async () => {
    const step = Math.floor(window.innerHeight * 0.8);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(120);
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await wait(250);
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await sleep(700);
}

async function shoot(page, file, options = {}) {
  const target = path.join(OUT, file);
  await page.screenshot({ path: target, ...options });
  console.log("  wrote", target);
}

async function captureRoute(context, device, route) {
  const page = await context.newPage();
  const slug = slugOf(route);
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await scrollThrough(page);
  await shoot(page, `${slug}-${device}-fold.png`);
  await shoot(page, `${slug}-${device}.png`, { fullPage: true });
  return page;
}

async function captureMobileExtras(page) {
  const dialog = '[role="dialog"]';

  // 1. Quick capture -> bottom sheet, with the number carried through.
  const quick = page.locator("#hero-quick-phone");
  if ((await quick.count()) > 0) {
    await quick.fill("9876543210");
    await page.getByRole("button", { name: "Get a call back" }).click();
    await page.waitForSelector(dialog, { timeout: 5000 });
    await sleep(600);
    const prefilled = await page.locator(`${dialog} input[name="phone"]`).inputValue();
    console.log(`  sheet phone prefilled: ${prefilled || "(EMPTY)"}`);
    await shoot(page, "home-mobile-sheet.png");
    await page.keyboard.press("Escape");
    // Wait for the sheet to actually leave the DOM, not a fixed delay - the
    // next click lands on the header and must not race the close.
    await page.waitForSelector(dialog, { state: "detached", timeout: 5000 });
    await sleep(300);
  } else {
    console.log("  (no #hero-quick-phone on this page - skipping sheet capture)");
  }

  // 2. Full-screen menu.
  await page.getByRole("button", { name: "Open menu" }).click();
  await sleep(800);
  await shoot(page, "home-mobile-menu.png");
  await page.keyboard.press("Escape");
  await page.waitForSelector('[aria-label="Menu"][role="dialog"]', { state: "detached", timeout: 5000 });
  await sleep(300);

  // 3. A card rail, to check the peek + dots.
  await page.evaluate(() => {
    document.querySelector("#courses")?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await sleep(900);
  await shoot(page, "home-mobile-rail.png");

  // 4. Branch picker -> batch sheet (video, mode switch, GST total).
  const chip = page.locator("#courses [data-branch]").first();
  if ((await chip.count()) > 0) {
    await chip.click();
    await page.waitForSelector(dialog, { timeout: 5000 });
    await sleep(700);
    await shoot(page, "home-mobile-branch-sheet.png");
    await page.keyboard.press("Escape");
    await page.waitForSelector(dialog, { state: "detached", timeout: 5000 });
    await sleep(300);
  }

  // 5. The demo video tile in view.
  await page.evaluate(() => {
    document.querySelector("[data-demo-tile]")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await sleep(700);
  await shoot(page, "home-mobile-video-tile.png");

  // 6. Sticky bar over the footer clearance.
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await sleep(700);
  await shoot(page, "home-mobile-bottom.png");
}

async function captureAboutMobile(page) {
  await page.evaluate(() => {
    document.querySelector("[data-journey]")?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await sleep(1400); // the spine and segments draw in over ~1.2s
  await shoot(page, "about-mobile-journey.png");
}

async function captureDesktopExtras(page) {
  await page.evaluate(() => {
    document.querySelector("#courses")?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await sleep(800);
  // Hover the first course card off-centre so the spotlight is clearly visible.
  await page.locator("#courses article").first().hover({ position: { x: 140, y: 90 } });
  await sleep(450);
  await shoot(page, "home-desktop-spotlight.png");
}

async function main() {
  let server = null;
  if (args.start) {
    console.log("Starting production server…");
    server = spawn("npm", ["run", "start"], { shell: true, stdio: "ignore" });
    await waitForServer(BASE);
  } else {
    await waitForServer(BASE, 15_000);
  }

  await checkAssets();
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  try {
    for (const [device, options] of Object.entries(DEVICES)) {
      console.log(`\n== ${device} ==`);
      const context = await browser.newContext(options);
      for (const route of ROUTES) {
        console.log(route);
        const page = await captureRoute(context, device, route);
        if (device === "mobile" && route === "/") await captureMobileExtras(page);
        if (device === "mobile" && route === "/about") await captureAboutMobile(page);
        if (device === "desktop" && route === "/") await captureDesktopExtras(page);
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
    if (server) {
      // Windows needs the tree killed, not just the npm wrapper.
      spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"], { shell: true, stdio: "ignore" });
    }
  }

  console.log(`\nDone. Screenshots in ${path.resolve(OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
