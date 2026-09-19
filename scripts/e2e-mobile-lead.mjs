#!/usr/bin/env node
/**
 * One-off end-to-end check of the mobile lead path, plus a reduced-motion
 * render check. Not part of `npm run shots` because this one DOES submit a
 * real enquiry (clearly labelled as a test).
 *
 *   node scripts/e2e-mobile-lead.mjs [--url http://localhost:3000]
 */
import { chromium } from "playwright";

const url = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:3000";

const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

const browser = await chromium.launch();
try {
  // ---- 1. Quick capture -> sheet -> submit, watching the network -----------
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  const posts = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("/api/enquiry")) {
      posts.push(JSON.parse(req.postData() ?? "{}"));
    }
  });

  await page.goto(url + "/", { waitUntil: "networkidle" });
  await page.locator("#hero-quick-phone").fill("9876500022");
  await page.getByRole("button", { name: "Get a call back" }).click();
  await page.waitForSelector('[role="dialog"]');

  await page.locator('[role="dialog"] input[name="full_name"]').fill("Mobile E2E Test (delete me)");
  await page.locator('[role="dialog"] select[name="branch"]').selectOption({ index: 1 });
  await page.locator('[role="dialog"] select[name="enquiry_for"]').selectOption({ index: 1 });
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForSelector('[role="dialog"] >> text=Thank you', { timeout: 10000 });

  console.log("POSTs to /api/enquiry:", posts.length);
  const body = posts[0] ?? {};
  console.log("  source      :", body.source);
  console.log("  phone       :", body.phone);
  console.log("  full_name   :", body.full_name);
  console.log("  branch      :", body.branch);
  console.log("  enquiry_for :", body.enquiry_for);
  console.log("  honeypot    :", JSON.stringify(body.company));
  await page.screenshot({ path: "screenshots/home-mobile-sheet-success.png" });
  await ctx.close();

  // ---- 2. Reduced motion: nothing may be left invisible -------------------
  const rm = await browser.newContext({ ...MOBILE, reducedMotion: "reduce" });
  const p2 = await rm.newPage();
  await p2.goto(url + "/", { waitUntil: "networkidle" });
  // No scroll-through on purpose: under reduced motion Reveal must fail open.
  const hidden = await p2.evaluate(() => {
    const els = Array.from(document.querySelectorAll(".js-reveal"));
    return els.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length;
  });
  const stat = await p2.evaluate(
    () => document.querySelector('[aria-label="10,000+"] span')?.textContent ?? "(missing)",
  );
  console.log("\nreduced motion:");
  console.log("  reveal elements still hidden:", hidden, hidden === 0 ? "(good)" : "(BAD)");
  console.log("  stat figure shown immediately:", stat);
  await p2.getByRole("button", { name: "Open menu" }).click();
  await p2.waitForTimeout(300);
  const menuItems = await p2.evaluate(() =>
    Array.from(document.querySelectorAll('[aria-label="Menu"] nav a, [aria-label="Menu"] nav button'))
      .filter((el) => Number(getComputedStyle(el).opacity) > 0.99).length,
  );
  console.log("  menu items visible at once:", menuItems, "of 6");
  await p2.screenshot({ path: "screenshots/home-mobile-menu-reduced-motion.png" });
  await rm.close();
} finally {
  await browser.close();
}
