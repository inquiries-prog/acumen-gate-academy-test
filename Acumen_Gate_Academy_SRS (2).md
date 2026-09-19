# Software Requirements Specification (SRS)
## Acumen Gate Academy — Website & Admin Platform

**Document version:** 1.0
**Prepared for:** Development team
**Client:** Acumen Gate Academy (Rohit Chandorkar)
**Domain:** Already purchased by client

---

## 1. Introduction

### 1.1 Purpose
This document specifies the complete functional and non-functional requirements for the Acumen Gate Academy website — a marketing, lead-generation, and e-commerce website for a GATE/GPSC coaching institute based in Vadodara, Gujarat. It is intended to give the development team everything needed to build the site without further discovery, **with special emphasis on the admin panel**, since the client is non-technical and the entire content model must be self-serviceable without code changes.

### 1.2 Project Background
Acumen Gate Academy was founded in 2014 by Rohit Chandorkar and operates as part of a wider ecosystem:
- **Acumen 360** (2008) — recruitment & HR consultancy, co-founded by Rohit and Himani Chandorkar. This is the entity behind the site's placement-support guarantee.
- **Acumen Gate Academy** (2014) — GATE & GPSC coaching, offline and online. **This is the subject of the website; it must always read as the lead entity, not diluted by the other two ventures.**
- **Etudew 360** (2020) — leadership training venture, incubated at IIM B-NSRCEL (a top-20 incubated venture in 2021), co-founded by Rohit and Himani Chandorkar. Himani is a certified coach and NLP practitioner who has trained 400+ managers and holds qualifications in OD Analysis, Transactional Analysis, and Learning Game Design.

Founder note for "Our Story" content (see §7.2): Rohit Chandorkar is a former Baroda Ranji Trophy Champion who transitioned from cricket to entrepreneurship at age 24, ran a manufacturing firm for a decade, then founded Acumen 360 out of a passion for learning and development.

### 1.3 Business Goals
1. Generate qualified leads (enquiries) from students seeking GATE/GPSC coaching.
2. Convert seminar attendees (the institute's primary admissions channel) into enrolled students.
3. Rank organically for searches like "GATE coaching in Vadodara," "best GATE coaching in Gujarat," and be citable by AI answer engines for questions like "should I join offline or online GATE coaching."
4. Support direct online enrollment and full-fee payment, **as part of this build, not a later phase** (see §11).
5. **Give the client (non-technical) complete self-service control over site content, images, batches, results, and leads — this is a first-class requirement, not an afterthought.**

### 1.4 Audience for This Document
Frontend/backend developers, project manager, and QA assigned to build this project.

---

## 2. Scope

> **Important — payment is part of this build, not a future phase.** Direct online enrollment with full-fee payment, GST-compliant invoicing, and paid-enrollment tracking (fully specified in §11) **must be built and delivered as part of the current production release.** There is no separate deferred "Phase 2" for payment — the client has confirmed this is needed now.

### 2.1 In Scope
- Public marketing website: Homepage, About Us, News & Updates, Results (all as fully specified below).
- Lead-capture system: two distinct enquiry flows (general enquiry, seminar-attendee offer).
- Batch/branch browsing system with detail popups.
- Guided (non-AI, button-driven) chat widget.
- **Direct online enrollment with payment gateway integration and GST invoicing** — see §11. This is part of the current build, to be delivered alongside everything else in this document, not deferred.
- **A complete, non-technical admin panel** covering every piece of editable content described in this document.
- SEO/GEO-oriented content structure and technical setup.

### 2.2 Explicitly Out of Scope (for now)
- **AI-powered chatbot.** Decision was made to start with a rule-based guided chat widget (cheap, predictable, zero risk of incorrect answers) rather than a true AI chatbot (ongoing API cost, requires careful configuration to avoid hallucinated answers). This can be revisited later once real usage patterns are known.
- **Mobile app.** Do not render any "Download the App" button in the current build; only architect the layout/data model in the batch-browsing UI so it can be added later without major rework — see §8.4.
- **A "Notes by Rohit Sir" annotation/feedback tool** was built as a temporary internal tool to let the client mark up static HTML demos during the design process. **It is not a production feature and should not be built into the live site.**
- **Faculty page as a separate page.** Faculty content lives only in the "Meet the Mentors" homepage section for now (see §7.1.9). A dedicated Faculty page was explicitly decided against, since it would duplicate the homepage content.
- Blog/News active publishing cadence is not guaranteed — see §7.3 for details; the *capability* must be built, but regular content creation is a client-side commitment, not a delivery requirement.

---

## 3. Brand & Design Guidelines

### 3.1 Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary background | White | `#FFFFFF` |
| Secondary background (alternating sections) | Off-white | `#FBF9F8` |
| Primary accent (CTAs, links, highlights) | Red | `#E31E24` |
| Dark red (hover/darker states) | Red-dark | `#A32D2D` |
| Headings / primary text | Charcoal | `#231F20` |
| Body / secondary text | Grey | `#5A5A5A` – `#767671` |
| Dark contrast sections (final CTA band) | Charcoal | `#231F20` (white text, red button) |
| Borders / dividers | Light grey | `#EDEBE9` |

### 3.2 Logo Usage
- Use the client-provided logo file (actual raster asset) consistently in the header and footer — never recolor/invert it via CSS filters (an earlier version did this and it visibly distorted the mark). In the dark footer, place the logo on a small white rounded chip so its real colors show correctly.
- Client will separately provide logo files for **Acumen 360** and **Etude 360** for the footer's "Part of the Acumen Ecosystem" badges — these are pending assets, see §12.

### 3.3 Typography & Layout Principles
- Headings: charcoal, bold weight.
- Body: grey, comfortable line-height.
- Hero section: headline (charcoal, larger) sits **above** the tagline (red, bold); do not repeat the same claim in both (e.g. avoid "trusted since 2014" appearing in both lines).
- No dead/excess whitespace between sections — client explicitly flagged spacing as needing to feel "tight and intentional," not gappy.

### 3.4 Responsiveness — Mobile Is a First-Class Requirement, Not an Afterthought
The client raised this repeatedly throughout scoping and it should be treated with the same seriousness as the admin panel (§9): **every single feature on this site must be fully usable on a phone, not just "not broken."** During prototyping, every feature described in this document was specifically tested at a ~390px mobile viewport width before being considered done — the development team should hold itself to the same standard, not just rely on generic responsive CSS and hope for the best.

**General rules:**
- One responsive codebase — there is no separate "mobile site." The same components reflow based on screen width.
- Header collapses to a hamburger menu on mobile, with the same 6 nav items plus click-to-call, accessible via a slide-in drawer.
- Grids (course cards, "Why Choose Acumen" cards, testimonial cards, mentor cards, Results page grid, pedagogy checklist) reflow from multi-column to 1–2 columns on mobile — verify actual readability at narrow widths, not just that it "fits."
- Sticky header on scroll, on both desktop and mobile.
- Touch targets (buttons, nav links, form fields, popup close buttons) must be comfortably tappable — avoid small/cramped controls that were only designed with a mouse cursor in mind.

**Specific components that need explicit mobile verification (not just assumed to work):**
- **The batches/branches modal (§7.1.6):** this is a large, content-heavy modal with 6 branch rows × 3 buttons each. On mobile this must remain fully scrollable and usable, not clipped or requiring horizontal scrolling.
- **All popups/forms (Enquire, Seminar, Enroll & Pay, batch detail, video)** must resize appropriately on mobile — full-width or near-full-width with proper padding, not a tiny centered box or an oversized one that overflows the viewport.
- **The guided chat widget (§8.3)** must reposition/resize sensibly on mobile (it is a fixed-position floating panel on desktop — on a small screen it should not overlap critical content or run off-screen).
- **The auto-scrolling carousel and the About Us "In the News" horizontal-scroll strip** must support touch-scrolling naturally on mobile, and the lightbox/enlarge behavior must still work via tap.
- **The Results page year-tabs** must remain usable when there are many years (2024, 2025, 2026, 2027...) — plan for horizontal scroll or wrapping on narrow screens rather than the tabs becoming unreadably cramped.
- **The footer's 4-column layout** must stack cleanly into a single column on mobile without losing any content or links.

**Acceptance bar:** before considering any feature in this SRS "done," it should be checked at a standard mobile width in addition to desktop — not signed off on desktop alone and assumed to translate.

### 3.5 Performance
- Fast load is a hard requirement — this is a coaching institute site where visitors are impatient; treat this with the same priority as visual design.
- Images: compressed, modern formats, lazy-loaded below the fold.
- Carousel/gallery images and embedded YouTube videos must **not** block initial page load — YouTube videos load only when a visitor actually opens "Watch Demo," not preloaded.
- No unnecessary pop-ups or heavy animation that hurts perceived speed.
- Minimal JS payload; avoid unnecessary third-party scripts.

---

## 4. Technical Architecture (Recommended)

| Layer | Recommendation |
|---|---|
| Frontend | Next.js |
| Database & image storage | Supabase |
| Admin dashboard | Custom-built, simple, non-technical (see §9) |
| Hosting | Vercel |
| Domain | Already owned by client; connect via DNS when ready |

This stack was chosen specifically because it is low-cost to run, doesn't require the client to manage a server, and supports the dynamic/admin-editable requirement well. The development team may substitute an equivalent stack if it satisfies all functional and admin requirements in this document — but the "everything is admin-editable, nothing needs a code deploy for routine content changes" requirement is non-negotiable regardless of stack choice.

---

## 5. Site Map

1. **Home** (`/`)
2. **About Us** (`/about`)
3. **News & Updates** (`/news`)
4. **Results** (`/results`)
5. Footer-only utility content: Contact info, Privacy Policy, Terms & Conditions (pages TBD, see §12)

Navigation (header, 6 items): About Us · Offline Courses · Online Courses · Results · News & Updates · Contact Us
*(Note: "Offline Courses" and "Online Courses" nav items open the batches popup directly — see §7.1.6 — they are not separate pages. "Contact Us" scrolls to/anchors the footer.)*

Two nav items considered and explicitly **removed** from the final structure: a standalone "Faculty" tab (redundant with the homepage mentors section) and a standalone "Enquire for Batches" tab (redundant with the always-visible header "Enquire Now" button).

---

## 6. Global Elements (present on every page)

### 6.1 Header
- Logo (top-left, links to Home)
- 6 nav items (see §5)
- Phone number, click-to-call: **098793 87738**
- "💬 Chat with us" button — opens the guided chat widget (§8.3)
- "Enquire Now" button — opens the general enquiry popup (§8.1)
- Hamburger menu on mobile with the same items plus click-to-call

### 6.2 Announcement Banner
- Thin strip directly below the header, visible immediately on page load (not a popup/modal — must not delay or block page content).
- **Fully admin-editable**: text, optional link/destination, and a master **show/hide toggle** (admin-level; separate from a visitor's personal dismiss).
- A visitor can also close it with an × for their own session (does not affect other visitors).
- Current content: *"🎓 Have you attended our Seminar? Know the exclusive offer waiting for you"* with a "Know more" link that opens the seminar-attendee popup (§8.2).
- Designed to be reused for any future campaign (scholarship tests, deadline reminders, etc.) without a code change — the admin toggle and text field are the entire mechanism.

### 6.3 Footer (4-column layout)
**Column 1:**
- Logo (on white chip, true colors)
- Tagline: "Gujarat's most trusted name in GATE coaching, since 2014."
- Social media icon row (Instagram, YouTube, Facebook — links to be provided by client)
- "Part of the Acumen Ecosystem" label with Acumen 360 and Etude 360 logo badges (pending assets)

**Column 2 — Quick Links:** About us · Courses · Results · News & Updates

**Column 3 — Our Centers:**
- Vadodara — Head Office: full address (201, Siddhivinayak Complex, Ellora Park Rd, next to Bank of India, Subhanpura, Vadodara, Gujarat 390023)
- Vidyanagar — Weekend Center: *no fixed address* (this is intentional — it is not a permanent office, just weekend classes; do not display a placeholder address here)

**Column 4 — Get in Touch:**
- Phone (click-to-call), email
- "Enquire Now" button (footer also converts, not just informs)

**Bottom bar:** Copyright line, Google rating badge (★★★★★ 5.0 · 163 Google Reviews), Privacy / Terms links (page content pending, see §12).

### 6.4 Guided Chat Widget
See §8.3 for full behavior spec. Present on every page via the header button.

---

## 7. Page-by-Page Functional Requirements

### 7.1 Homepage

Section order (top to bottom) — **this exact order is finalized, do not reorder without checking with the client:**

1. Header
2. Announcement banner
3. Hero
4. Auto-scrolling result/press carousel
5. "10,000+ GATE Success Stories and Counting." stat line
6. Our Courses (3 cards)
7. Why Choose Acumen as Your GATE Partner (6 cards)
8. Success Stories and Testimonials (6 cards)
9. Meet the Mentors (6 real faculty)
10. Final CTA band
11. Footer

#### 7.1.1 Hero
- Headline (charcoal, larger, positioned first): **"Every GATE Rank tells a story. Start writing yours."**
- Tagline (red, bold, positioned below headline): **"Gujarat's most trusted name in GATE coaching since 2014"**
- Two CTA buttons: "Enquire now" (primary, opens §8.1) and "Explore courses" (secondary, scrolls to §7.1.6)
- No Google-reviews badge here (it lives in the footer bottom bar instead — avoid duplicating trust signals awkwardly).

#### 7.1.2 Carousel
- Auto-scrolling horizontal strip, **slow, continuous** — not fast/jarring. (Client explicitly asked to slow this down from an earlier faster version.)
- Content: a curated mix of real student "GATE 26 Success" congratulations posts and real newspaper clippings (Times of India, Divya Bhaskar, Gujarat Samachar, Sandesh coverage of student results). Client has ~84 real images from an Instagram post archive plus 5 newspaper-clipping pages — the admin panel must let the client manage this full library (add/remove/reorder), not just a fixed hardcoded set.
- **Click any image → pauses the auto-scroll and opens that image enlarged** in a lightbox/modal. Closing the lightbox resumes auto-scroll.
- This carousel and its lightbox must remain functional site-wide regardless of which page/route the visitor is currently on (a real bug was found and fixed during prototyping where these shared UI elements stopped working once page-routing was introduced — ensure your implementation doesn't reintroduce this class of bug).

#### 7.1.3 Stat Line
- Large, bold, red text: **"10,000+ GATE Success Stories and Counting."**
- This is the *only* headline number used across the entire site. Do not introduce other totals (e.g. "students trained," "GATE rankers created") elsewhere unless the client explicitly supplies and approves a consistent, non-contradictory number — earlier drafts had internally inconsistent numbers (a smaller "students trained" figure that was mathematically smaller than the success-story count) and these were deliberately removed. **Number consistency across the whole site is a hard requirement.**

#### 7.1.4 Our Courses (3 cards)
Card 1 — **Classroom Courses**: real client-provided classroom photo (not a placeholder/illustration in production), banner label, short description, button "Click to know upcoming batches" → opens the Offline batches popup (§7.1.6) filtered/defaulted to offline.
Card 2 — **Online Courses**: illustration (client may supply a real photo later), same button pattern → opens Online batches popup.
Card 3 — **GPSC Coaching**: illustration, description covering GPSC exam prep for engineering roles, button opens the general enquiry popup (no dedicated GPSC batch browsing yet — flagged as a future page in §12).

*(Note: an earlier iteration had a 3rd card reserved as a generic "admin-addable" slot — client decided instead to make GPSC Coaching the fixed 3rd card. The concept of an admin-addable extra course slot can be revisited later but is not required now.)*

#### 7.1.5 Why Choose Acumen as Your GATE Partner (6 cards, equal visual weight — no card should be visually highlighted/different from the others)
1. **Proven results across Gujarat** — "Thousands of students have built their careers through PSUs, IITs, and IISc with Acumen's guidance since 2014."
2. **Mentors who know you personally** — "Small batch sizes mean real relationships — your mentors know your strengths and weak points, and stay with you through both."
3. **Always reachable, even online** — "Based right here in Vadodara — even online batch students can call, walk in, or reach out directly. Real people, not a ticket queue."
4. **We work around your university** — "Class schedules adjust around your college exams — end-sems, internals — so GATE prep never competes with your degree."
5. **Comfortable classrooms with library** — "A proper study environment — comfortable classrooms and a dedicated library facility, not just a rented room."
6. **Real placement support** — "80%+ attendance and 80%+ assignment/test completion gets you placement support through Acumen 360 HR Consultancy, running since 2008."

This section exists specifically to answer the objection "why pay more for offline than a big national online platform" — content should stay factual/confident, not defensive.

#### 7.1.6 Batches & Branches System (triggered from Our Courses cards and header nav)
This is one of the more complex interactive pieces — implement carefully.

- Clicking "Offline Courses" (nav or course card) or "Online Courses" opens a **large, spacious modal** (not a cramped popup) listing **all 6 branches**: **ME (Mechanical), CE (Civil), CSE (Computer Science), EE (Electrical), EC (Electronics & Communication), CH (Chemical)**.
- Each branch row shows: branch name, mode (Offline/Online), start date, and **3 action buttons**:
  1. **Enquire Now** → opens the general enquiry popup (§8.1)
  2. **Know about the batch** → opens a detail popup (below)
  3. **Watch Demo** → opens a video popup embedding a real YouTube video inline (never redirects the visitor off-site to YouTube). For now the client has supplied one real demo video to use as a placeholder across all branches (video ID `2nh8TYHqa8s`, start timestamp 824s). **Admin panel must have a per-batch/per-branch video-link field** so each branch can eventually get its own specific video (§9).
  4. A 4th action, **"Download the App,"** was discussed but must **not be rendered at all** in the current build. Do not build a placeholder/disabled button — simply don't render it, while architecting the layout/data model so a 4th action can be added later without major rework.

- **"Know about the batch" popup** shows: mode, start date, duration, faculty assigned, fees, and the full **9-point pedagogy checklist**:
  1. 450+ hours of offline teaching
  2. App access for live and recorded lectures
  3. Weekly assignments & tests
  4. National level test series
  5. Books in soft copy on the app
  6. Mentoring sessions
  7. Post-GATE guidance
  8. Admission support
  9. Placement assistance

  This popup has two buttons: **"Enroll & Pay Now"** (§11) and **"Enquire for this batch"** (§8.1).

#### 7.1.7 Success Stories and Testimonials
- 6 cards mixing photo-based success stories and video testimonials, drawn from across the client's target universities: **MSU Baroda, Parul University, Charusat University, BVM Vallabh Vidyanagar, DDU Nadiad, Navrachana University** (plus GECS and others per copy in §7.2).
- Cards show: photo/video thumbnail (video ones have a play-button overlay opening the video popup), university, quote/testimonial text, name, and rank/branch.
- "View all success stories" button → links to the dedicated **Results** page (§7.4).
- Section title is **"Success Stories and Testimonials"** (not just "Success Stories" — client specifically requested this exact wording).

#### 7.1.8 Final CTA Band
Dark charcoal full-width section: "Ready to start your GATE journey?" + "Talk to us" button opening the general enquiry popup.

#### 7.1.9 Meet the Mentors
- 6 real faculty, each with photo, short bio, name, title ("Lead Mentor"):
  1. **Dr. Umashankar Tripathi** — PhD & MTech from IIT Roorkee, 13+ years teaching, multiple GATE qualifications, 3 SCI research papers, 76.02 marks in GATE
  2. **Er. Mukesh Rai** — ME in Structural Engineering, 10 years teaching, 3-time Best Faculty Award recipient, author of 28+ books on GATE/GPSC
  3. **Er. Mrunal Shah** — multiple times under-500 GATE rank, 8+ years teaching, cleared ISRO and BARC exams, created 500+ GATE rankers
  4. **Er. Surbhi Jain** — Masters in Engineering, 7 years teaching, authored foundation books of Civil Engineering
  5. **Er. Ashish Katare** — 11 years teaching in national institutes, ex-government officer (MP IT Department), recognized as one of the best GATE faculty for CS
  6. **Er. Shefali Singhla** — Masters in Computer Science from Canada, 12 years teaching, renowned CS faculty in India
- Intro line above the grid: **"We bring the best GATE faculties from India to Gujarat"** plus a credibility statement that all faculty are GATE top rankers or from PSUs, and multiple-time GATE qualifiers.
- Carousel/prev-next navigation if the grid doesn't fit all 6 on one row (mobile).

---

### 7.2 About Us Page

Purpose: primary SEO/GEO landing content, and the deeper trust/credibility page for serious prospects. Section order:

1. **Opening Statement** (hero-style, short factual SEO/GEO paragraph):
   > "Acumen Gate Academy is one of Gujarat's most trusted GATE coaching institutes, headquartered in Vadodara since 2014, with a weekend center in Vidyanagar. Founded by Rohit Chandorkar, Acumen has guided over 10,000 GATE success stories across Gujarat, through offline coaching and live online batches covering Mechanical, Civil, Computer Science, Electrical, Electronics & Communication, and Chemical Engineering, along with GPSC coaching. Our faculty are drawn from IITs, GATE toppers, PSUs, and government officials, bringing verified, real-world expertise into every classroom."

2. **Our Story**:
   > "Rohit Chandorkar, a former Baroda Ranji Trophy Champion, transitioned from cricket to entrepreneurship at the age of 24, running a successful manufacturing firm for a decade. Following his passion for learning and development, he founded Acumen 360 — a recruitment and HR consultancy — together with his wife and co-founder Himani Chandorkar, who brought 19 years of experience across manufacturing, services, and entrepreneurship. In 2014, Rohit founded Acumen Gate Academy, extending Acumen's industry-facing approach into GATE coaching, built around preparing students not just to clear an exam, but to build real careers. In 2020, Rohit and Himani launched Etude 360, a leadership training venture incubated at IIM B-NSRCEL — among the top 20 ventures incubated there in 2021. A certified coach and NLP practitioner, Himani has personally trained 400+ managers and holds qualifications in OD Analysis, Transactional Analysis, and Learning Game Design. Today, Acumen Gate Academy sits within this larger ecosystem — students preparing for GATE are connected to the same industrial, HR, and leadership network built across Acumen 360 and Etude 360."

3. **"Not Just Coaching — An Ecosystem"** (3 cards; Acumen Gate Academy card should be visually distinguished/highlighted as the lead entity, e.g. a colored border, while the other two are equal-styled to each other):
   - **Acumen Gate Academy — 2014** — GATE & GPSC coaching, offline and online, across six engineering branches
   - **Acumen 360 — 2008** — Recruitment & HR consultancy, co-founded by Rohit & Himani Chandorkar — the network behind Acumen's placement support
   - **Etude 360 — 2020** — Leadership training venture incubated at IIM B-NSRCEL — a top 20 incubated venture in 2021

4. **Our Pedagogy** — the same 9-point list as §7.1.6, presented as a proper section with intro copy here (this is the "full" version; the homepage intentionally does *not* have a separate pedagogy section — it was tried and removed for being too heavy on the homepage).

5. **What Makes Us Different**:
   > "With a presence across Gujarat — from our Vadodara center to seminar partnerships with universities including Charusat, Parul, MSU, BVM, DDU, Navrachana, GECS, and many other Gujarat-based universities — Acumen is built around one core belief: mentors and students should actually know each other. At Acumen, faculty know you personally, and you know them — not as a name on a schedule, but as a mentor who tracks your progress through the highs and the lows.
   >
   > That relationship extends beyond the classroom. Acumen's alumni network today spans IITs, IISc, top companies, PSUs, and placements abroad — a living network current students can lean on.
   >
   > We also understand GATE preparation doesn't happen in isolation. Every batch schedule is designed around your college's end-semester and mid-semester exams, so GATE prep supports your degree instead of competing with it."

6. **Our Centers**:
   - Vadodara — Head Office (full address, phone, "Enquire Now" button)
   - Vidyanagar — Weekend Center (no address, description text, "Enquire Now" button)
   - Both cards must have the **same** "Enquire Now" button treatment (an earlier draft only had it on one card — fixed for consistency).

7. **In the News** — a **horizontal, manually-controlled scrollable strip** (left/right arrow buttons; NOT auto-scrolling like the homepage carousel) of real press clippings. Clicking any image opens it enlarged in the same lightbox component used elsewhere on the site (reuse, don't rebuild).

8. **FAQ Accordion** — 10 questions, click to expand/collapse, detailed guide-style answers (written for both human readers and AI/search engines to extract directly):

   1. **Is Acumen Gate Academy the best GATE coaching in Vadodara?**
      "Acumen Gate Academy has been coaching GATE aspirants in Vadodara since 2014, with over 10,000 GATE success stories to date. Our faculty include IIT graduates, GATE toppers, PSU professionals, and government officials, and our students consistently feature in newspaper coverage across Gujarat. Our mentor-student relationships and placement support through Acumen 360 offer something no large, online-only platform can replicate."

   2. **Does Acumen offer GATE coaching across Gujarat, or only in Vadodara?**
      "Acumen Gate Academy is headquartered in Vadodara, with a weekend center also held in Vidyanagar. Beyond our physical centers, we conduct seminars and expert sessions at universities across Gujarat, including Charusat, Parul, MSU, BVM, DDU, Navrachana, GECS, and many other Gujarat-based universities. Our online batches are also open to students anywhere in Gujarat, and beyond."

   3. **Should I join offline or online GATE coaching?**
      "At Acumen, we believe offline coaching consistently delivers better results than online-only learning — especially compared to large national online platforms where you're one of thousands of anonymous learners with no real mentor relationship. In an offline classroom, your mentor knows you personally, tracks your progress, and adjusts to how you actually learn. That said, we understand not everyone can attend in person, which is why our online batches are built to bring as much of that same structure and mentor access as possible, rather than leaving you with recorded videos alone."

   4. **What branches does Acumen Gate Academy cover for GATE coaching?**
      "Acumen offers GATE coaching across six branches: Mechanical Engineering (ME), Civil Engineering (CE), Computer Science Engineering (CSE), Electrical Engineering (EE), Electronics & Communication (EC), and Chemical Engineering (CH), in both offline and online formats."

   5. **Does Acumen provide placement support after GATE?**
      "Yes. Students who maintain 80%+ attendance and complete 80%+ of assignments and tests through their batch become eligible for placement support through Acumen 360, our recruitment and HR consultancy running since 2008. This isn't a generic promise — it's a structured outcome tied to genuine effort during your GATE preparation."

   6. **Where are Acumen Gate Academy's centers located?**
      "Our head office and main offline center is in Vadodara, at 201, Siddhivinayak Complex, Ellora Park Rd, next to Bank of India, Subhanpura, Vadodara, Gujarat 390023. We also hold a weekend center in Vidyanagar for students in that region."

   7. **Does Acumen also offer GPSC coaching?**
      "Yes. Alongside our core GATE coaching programs, Acumen offers dedicated GPSC coaching for engineering roles — covering GPSC Class 1, Class 2, and Class 3 exams, for students and professionals preparing for Gujarat state government engineering services."

   8. **Should I start preparing for GATE in 3rd semester, or is 5th semester okay?**
      "At Acumen, we recommend starting GATE preparation in 3rd semester. Most of the GATE technical syllabus is spread across your 3rd to 6th semester coursework, so starting early means your GATE preparation and college subjects reinforce each other from the very beginning. Students who start in 3rd semester typically build a strong enough foundation to qualify GATE in their very first attempt, often as early as their third year — rather than facing a rushed, high-pressure attempt in their final year. Starting in 5th semester is still workable, but it usually means a faster, more intensive pace to cover the same ground."

   9. **What is the best time to start GATE preparation?**
      "The best time to start is 3rd semester. Since most GATE-relevant technical subjects are taught between 3rd and 6th semester, an early start lets you absorb these subjects once, for both your college exams and GATE, rather than relearning them later. This timing also gives students a genuinely strong chance of qualifying GATE on their first attempt, without waiting until final year when time and pressure are both working against you."

   10. **How do I manage GATE preparation alongside college studies?**
       "This is exactly why Acumen designs its batch schedules around your college's academic calendar — including end-semester and mid-semester exam periods — so GATE classes never directly conflict with your college exams. We also recommend students treat GATE-relevant college subjects as dual-purpose study time, rather than two separate efforts. Our mentors work with students individually to adjust pacing during heavier college exam periods, so preparation continues without falling behind."

9. **Closing CTA** — "Talk to us" opening the general enquiry popup.

---

### 7.3 News & Updates Page

**Purpose:** capture organic search traffic from PSU/government recruitment notifications and GATE-related announcements — when a major recruitment notice drops (e.g. ONGC, BHEL, CPCB), students immediately search for it, and a fast, well-written post can rank within days and bring in highly-qualified, GATE-relevant traffic. This is a deliberate SEO/GEO content strategy, not filler content.

**Important delivery note:** build the *capability* (see below) as a required feature, but do not treat "actively publishing new posts every week" as something the development team delivers — that is an ongoing content responsibility for the client's team. An abandoned-looking news page with stale posts is worse than not having the feature at all, so the admin publishing flow must be **fast and low-friction** (title, short excerpt, full content, publish — nothing more) to make it realistic for the client to actually keep it updated.

**Page structure:**
- Hero: "Stay Updated on GATE & PSU Recruitment News"
- List of posts, each showing: date, title, excerpt, and a "Read more" toggle that expands the full content inline (no separate page load required, though a separate URL per post is fine/better for SEO if straightforward to implement).
- Sample seed post (real, already used in prototyping) to model the format on: a CPCB recruitment notification post explaining that CPCB's Scientist-B and Scientific Assistant roles require a valid GATE score of 90th percentile — demonstrating how a notification post should tie back to GATE relevance.
- Each post should support a closing tie-back to Acumen's services (e.g. "Acumen students receive updates on notifications like this as part of our post-GATE guidance") and ideally an Enquire CTA.

---

### 7.4 Results Page

Purpose: give serious prospects (and search engines) a much deeper library of real results than the homepage teaser can hold — the client has ~84 real student result images plus press clippings; the homepage only surfaces a curated handful, so this page is where the rest actually gets used.

**Section 1 — GATE Results:**
- **Year tabs** (e.g. GATE 2026 / GATE 2025 / GATE 2024) — clicking a tab filters the grid below to that year.
- **Admin must be able to add new year tabs indefinitely** (GATE 2027, 2028, and so on, forever) — this must not be a hardcoded set of years in code.
- **Each year tab must be individually hideable/showable by admin** — e.g. the client may want to show only the current year by default, then temporarily reveal all years at once when demonstrating a multi-year track record (such as during a seminar or to a parent).
- Grid content per result: student photo, name, university, branch, AIR (All India Rank).
- This is intentionally denser and more data-forward than the homepage teaser — less narrative, more scannable proof.

**Section 2 — What Our Students Say:**
- Separate from the Results grid — this is the **narrative/testimonial** content (photo or video + quote + name + university + rank), not just data. Deliberately kept as its own section rather than merged into the Results cards, so the page serves both "prove it with numbers" and "prove it with stories" separately.

**Section 3 — Closing CTA.**

---

## 8. Forms, Popups & Lead Capture

### 8.1 General Enquiry Popup ("Enquire Now")
Triggered from: header button, hero CTA, course cards, batch rows, footer, final CTA band — i.e., globally accessible, not page-specific.

**Fields (final, deliberately short):**
- Full Name
- Phone Number
- Branch
- Enquiry For — dropdown: *Offline at Vadodara / Offline at Vidyanagar / Online*
- How did you hear about us? — dropdown: *College seminar/session / Friend or senior referral / Instagram/Social media / Google search / Newspaper / Walk-in / Other*

**Explicitly removed from this form** (do not add them back without client sign-off): Email ID, University/College, Residential City. These were removed deliberately to shorten the form and increase conversion. Because there is no email field, **do not attempt to send an email confirmation from this form** — confirmation to the student must be via **SMS/WhatsApp** instead (see §10).

On submit: success message thanking the user and confirming a callback within 24 hours, with confirmation "also sent to your phone via SMS/WhatsApp."

### 8.2 Seminar Attendee Popup
Triggered from: the announcement banner's "Know more" link, and the chat widget's "I attended a seminar" option.

**Heading:** "Great that you have attended the seminar! Can you help us with some more information?"

**Fields:**
- Name
- Mobile
- Branch
- University
- Residential City
- Interested For — dropdown: *Offline batch / Online batch*

**Behavior:** On submit, reveal a **college/university-specific offer** (the offer text varies depending on which college the seminar happened at — admin must be able to configure a distinct offer per university, see §9). This is functionally a separate lead list from general enquiries (see §10) — do not merge the two into one undifferentiated lead table.

### 8.3 Guided Chat Widget
- **Not an AI chatbot.** Purely button/menu driven — no free-text input required. This was a deliberate choice: cheap, predictable, cannot produce an incorrect or embarrassing answer because every response is pre-written.
- Opens from the header "Chat with us" button.
- **Main menu:** "Hi! How can we help you today?" with 4 options:
  1. 🎓 Offline batch info → short info blurb + "See offline batches" (opens §7.1.6 offline modal) + Back + fallback option
  2. 💻 Online batch info → same pattern for online
  3. 📝 I attended a seminar → short blurb + "Know my offer" (opens §8.2) + Back + fallback
  4. ☎️ Talk to a counsellor → **fallback destination** (see below)
- **Fallback (present in every menu, not just reachable from the main menu):** "For anything specific, our counsellors are best placed to help — call us directly, or fill a quick form and we'll reach out within 24 hours," with buttons: "📞 Call [phone number]" (tel: link) and "📝 Fill the enquiry form" (opens §8.1) and "Back to menu."
- **Critical rule:** the widget must never attempt to answer a question it wasn't explicitly designed to answer — any ambiguous or unhandled input path must route to the fallback, never to a guessed/generated response. If you are asked in the future to add free-text input or true AI capability to this widget, treat that as a distinct, separately-scoped feature (see §2.2) — do not silently upgrade it.

### 8.4 "Download the App" (do not build)
Referenced in §7.1.6 as a 4th action button concept for batch rows. **Do not render this button at all** in the current build — not even in a disabled/placeholder state. It exists here in the SRS only so that the layout/data model can accommodate adding it later without rework (e.g. don't hardcode "3 buttons only" in a way that makes a 4th impossible to add). This wording applies uniformly everywhere this feature is mentioned in this document.

---

## 9. Admin Panel Requirements (Critical — Read Carefully)

**This is the most important non-visible part of the project.** The client is explicitly non-technical and has stated repeatedly throughout scoping that the entire value of a dynamic/CMS-backed site depends on how easy the admin panel is to use. Every requirement below should be read with the mindset: *"a non-technical person, alone, with no developer help, must be able to do this in under a minute."*

### 9.1 General Admin UX Principles
- Plain-language labels, no technical jargon ("Edit Homepage Text," "Manage Courses," "Upload Photo" — not "CMS entries," "assets," "records").
- Every content block described in this SRS as text/image/list must have a corresponding simple edit screen — a form with labeled fields and a Save button. No raw HTML/code editing exposed to the client.
- Image fields must show a preview of the current image and a simple "Replace" upload control (drag-and-drop or file picker) — not a URL field.
- Simple login (email/password) for the client; no complex permission system needed for v1 (single admin user is acceptable, but architect so multiple admin users can be added later).
- Autosave or clear Save confirmation on every screen — the client should never lose edits or be unsure whether something saved.
- A sensible admin home/dashboard screen linking to each management area listed below, ideally with a "Leads" count/summary visible immediately on login.

### 9.2 Admin-Editable Content Inventory

| Content area | What admin can do |
|---|---|
| **Announcement banner** | Edit text, edit link destination, master show/hide toggle |
| **Hero section** | Edit headline text, tagline text |
| **Carousel/result gallery** | Add/remove/reorder images, tag each as "result" or "press clipping" (or similar), from a growing library (not fixed to the initial ~84 images) |
| **Our Courses cards** | Edit title, description, and photo for each of the 3 cards |
| **Batches & branches** | Add/edit/remove batches per branch (ME/CE/CSE/EE/EC/CH) × mode (Offline/Online): start date, duration, faculty assigned, fees, **YouTube video link for "Watch Demo" — per branch/batch, not global** |
| **Why Choose Acumen cards** | Edit heading + body text for each of the 6 cards |
| **Success Stories & Testimonials (homepage)** | Add/remove/edit cards: photo or video upload, university, quote text, name, rank/branch — no fixed count |
| **Mentors** | Add/edit/remove faculty: photo, bio text, name, title |
| **Results page — Years** | **Add new GATE years without limit** (2027, 2028, ...); **show/hide each year independently**; within each year, add/edit/remove student result entries (photo, name, university, branch, AIR) |
| **Results page — Testimonials** | Same as homepage testimonials but this is the fuller/separate library for the dedicated page |
| **News & Updates posts** | Create/edit/delete posts: title, date, excerpt, full content — this must be a fast, lightweight flow (a handful of fields, publish) |
| **Seminar offer form** | Manage the list of universities in the dropdown, and **set a distinct offer per university** shown after submission |
| **General enquiry form** | Admin should be able to edit the dropdown option lists ("Enquiry For," "How did you hear about us") without a code change, in case new centers or referral sources are added later |
| **About Us page copy** | Edit each text block (Opening Statement, Our Story, What Makes Us Different) and the Ecosystem cards |
| **FAQ** | Add/edit/remove/reorder FAQ question-answer pairs |
| **Footer** | Edit tagline, social links, ecosystem badge logos (once client supplies Acumen 360/Etude 360 logos), center info, contact details |
| **Leads / Enquiries** | View, sort, filter, mark-as-contacted, and export (CSV/Excel) — **as two clearly separated lists: General Enquiries and Seminar Leads** (see §10) |
| **Enrollments/Payments** | View a list of paid enrollments separately from unpaid leads, with status and payment reference |

### 9.3 What Must NOT Require a Developer
Explicitly, none of the following should ever require touching code or redeploying:
- Adding a new GATE year to the Results page
- Adding/removing a batch or changing its fee/date/faculty
- Swapping any photo anywhere on the site
- Turning the announcement banner on/off or changing its message
- Adding a new News & Updates post
- Adding a new FAQ item
- Changing a seminar offer for a specific university, or adding a new university to the list

If a proposed technical approach would make any of the above require a code change, it does not meet this specification and should be revisited before implementation.

---

## 10. Lead Notification & Management

- **Two separate lead lists** in the admin dashboard: **General Enquiries** (from §8.1) and **Seminar Leads** (from §8.2). Do not merge them into one undifferentiated table — the client follows them up differently.
- **On every submission:**
  1. Logged immediately into the relevant admin dashboard list (name/fields + timestamp), sortable and exportable.
  2. **Email notification to the client's team** (a configurable notification email address).
  3. **SMS/WhatsApp confirmation to the student** (not email — neither form collects an email address). This requires integrating a paid SMS/WhatsApp API provider (e.g. Twilio, Gupshup, or similar — provider not yet chosen by client, flagged in §12 as a pending decision with an ongoing cost implication the client should be made aware of before committing).
- Admin should be able to mark a lead as "contacted" to track follow-up status.

---

## 11. Direct Enrollment & Payment — Required in This Build

**This is part of the current production release, not a deferred phase.** The client has explicitly confirmed the payment gateway must be integrated now, live at launch, alongside every other feature in this document — do not treat this section as optional or lower-priority scope.

**Trigger:** "Enroll & Pay Now" button inside the "Know about the batch" popup (§7.1.6), alongside "Enquire for this batch."

**Flow:**
1. **Enrollment details form:** Full Name, Phone Number, **Email ID** (required here specifically, even though the general enquiry form doesn't collect one — a payment receipt legally needs an email), Billing Address (for GST invoice).
2. **Payment summary screen:** shows the batch's fee, GST at 18% calculated and displayed as a separate line, and the total payable.
3. **Payment gateway integration:** client has **GST registration**, so the payment must generate a **proper GST tax invoice** — this is a legal requirement, not optional. Payment gateway is not yet chosen (Razorpay, PayU, and Instamojo were discussed as common India-first options) — this is a pending decision flagged in §12 and should be resolved early, since it directly blocks building this required feature.
4. **On success:** automatic GST invoice generated and emailed to the student, SMS/WhatsApp confirmation, and the lead is logged in the admin dashboard as a **"Paid Enrollment"** — a status/list distinct from ordinary leads, so the client's team knows to onboard the student rather than just follow up.
5. **On failure/abandonment:** still capture the entered Name/Phone/Email as a lead so the client's team can manually follow up and help complete the payment — do not silently drop abandoned payment attempts.

**Full payment only** — the client decided against a token/registration-fee-only model; students pay the complete course fee online in this flow.

---

## 12. Assets & Decisions Pending From Client

The development team will need the following before certain features can be finalized — flag these early rather than blocking on them silently:

- [ ] Acumen 360 and Etude 360 logo files (for footer ecosystem badges)
- [ ] Real photos: additional mentor photos if not already provided, additional/replacement success-story student photos, a real online-class photo (current asset is an illustration)
- [ ] Real per-branch/per-batch YouTube demo video links (only one placeholder video exists currently, used across all branches)
- [ ] GSTIN number and registered business legal name/address (for invoicing — **required before launch**, since payment is part of this build)
- [ ] Payment gateway account decision and credentials (Razorpay / PayU / Instamojo / other) — **this is a blocking dependency for a required feature, not a nice-to-have; resolve as early as possible**
- [ ] SMS/WhatsApp API provider decision and account (ongoing cost — client should confirm budget comfort before this is built)
- [ ] Business notification email address for lead alerts
- [ ] Domain DNS access/cooperation for go-live cutover
- [ ] Privacy Policy and Terms & Conditions copy (**required before launch**, since online payment is live from day one)
- [ ] Real batch fees, start dates, and seat counts (current values in prototypes are illustrative placeholders)
- [ ] Social media links (Instagram, YouTube, Facebook) for the footer
- [ ] Confirmation of who on the client's team will own News & Updates publishing (affects whether that section should launch populated or empty — see §7.3)

---

## 13. SEO / GEO Requirements

- **Google Business Profile**: client should claim/optimize this in parallel with development (not a dev task, but worth noting since it materially affects "best GATE coaching in Vadodara"-type search results more than the website alone does).
- **Consistent NAP** (Name, Address, Phone) across the website, Google Business, and any directory listings — the address and phone number used throughout this SRS must be reproduced identically everywhere (no variant formatting).
- **Structured data / schema markup**: mark up the site as an `EducationalOrganization` with address, phone, and course offerings.
- **Meta titles/descriptions**: must be **admin-editable per page**, not hardcoded — add this to the admin inventory in §9 even though it's not a visible content block, since it's still something the client may want to tune post-launch without a developer.
- **Clean URL structure** (e.g. `/results`, `/about`, `/news`, not query-string-based routing).
- **Sitemap and robots.txt**, submitted to Google Search Console at launch.
- **Alt text on all images** (also an accessibility requirement).
- **Content written for AI/GEO extraction**: the FAQ (§7.2) and About Us copy are deliberately written as direct, factual statements rather than pure marketing language, specifically so AI answer engines (ChatGPT, Perplexity, Google AI Overviews) can extract and cite them accurately. Preserve this style if any of the provided copy is edited or extended — avoid vague marketing language in place of concrete, checkable facts.
- **Number consistency** (see §7.1.3) is also an SEO/GEO integrity issue, not just a copywriting nicety — inconsistent facts across pages actively hurt credibility with both search engines and AI systems that cross-reference claims.

---

## 14. Non-Functional Requirements Summary

- **Performance:** fast initial load, lazy-loaded imagery, no blocking third-party scripts, video content loads on-demand only.
- **Responsiveness:** full desktop/tablet/mobile support as detailed in §3.4 — treat mobile testing as a required step in QA sign-off for every page and feature, not an optional pass at the end of the project.
- **Browser support:** current versions of Chrome, Safari, Firefox, Edge (desktop and mobile).
- **Accessibility:** reasonable baseline (alt text, sufficient color contrast, usable focus states) — not specified as a formal WCAG compliance target, but should not be actively neglected.
- **Security:** standard best practices for form handling (validation, spam/bot protection on lead forms), secure admin authentication, PCI-compliant handling of payments (i.e., use the payment gateway's hosted checkout/tokenization rather than handling raw card data directly).
- **Data ownership:** all content, images, and lead data must be exportable by the client (not locked into a proprietary format) — this matters given the emphasis on client independence from the developer post-launch.

---

## 15. Summary of Explicit Client Decisions Worth Re-Confirming at Kickoff

These are decisions that were revisited/changed multiple times during scoping — worth a quick re-confirmation with the client before development begins, to avoid building the wrong version:

1. Faculty is **not** a separate page — homepage section only.
2. The general Enquiry form has **no email/university/city fields** — confirmations go via SMS/WhatsApp, not email.
3. The 3rd "Our Courses" card is **GPSC Coaching**, not a generic admin-addable slot.
4. "Download the App" must **not** be rendered in the current build, in any state (not even disabled/placeholder) — only the layout/data model should anticipate it.
5. The chat widget is **rule-based only**, explicitly not an AI chatbot, for now.
6. Results page years must support **unlimited future years**, each independently hideable.
7. Only **one** headline stat ("10,000+ GATE Success Stories and Counting.") is used site-wide — no other totals.
8. Vidyanagar has **no listed address** anywhere on the site (weekend center only).
9. The internal "Notes by Rohit Sir" annotation tool used during design review is **not** part of the production site.
10. **Payment gateway integration, GST invoicing, and paid enrollment (§11) are required in this build, live at launch — not a deferred/future phase.** Payment gateway provider selection is a blocking dependency and should be resolved as early as possible in the project timeline.

---

*End of document.*
