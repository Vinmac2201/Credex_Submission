# Devlog

## Day 1 — 2026-05-26
**Hours worked:** 8  
**What I did:** Set up the Next.js + TypeScript project, built the core SpendCheck AI interface, added the AI tool spend form, implemented INR-based pricing assumptions, and created the first deterministic audit engine. Added support for Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.  
**What I learned:** The audit logic has to be conservative. A recommendation that looks mathematically cheaper can still be bad if it ignores actual usage fit, team controls, or plan intent.  
**Blockers / what I'm stuck on:** Needed to connect a real backend and make sure deployed serverless behavior matched local behavior.  
**Plan for tomorrow:** Add storage, shareable URLs, lead capture, and improve the audit reasoning.

## Day 2 — 2026-05-27
**Hours worked:** 3  
**What I did:** Connected Supabase storage for audits and leads, added the public `/audit/[id]` report page, and configured Vercel deployment. Added environment-variable based configuration so no secrets are committed.  
**What I learned:** Local filesystem fallbacks are useful for development but should not be trusted on Vercel serverless deployments. Supabase is the right production path for persistent share URLs.  
**Blockers / what I'm stuck on:** Needed to verify the deployed audit flow end to end and make sure report URLs worked after deployment.  
**Plan for tomorrow:** Add Anthropic summary generation and transactional email support.

## Day 3 — 2026-05-28
**Hours worked:** 2.5  
**What I did:** Added Anthropic API integration for the personalized summary with a templated fallback. Added Resend email support for captured leads and documented the full prompt in `PROMPTS.md`.  
**What I learned:** The LLM should explain the audit, not create the audit. Keeping pricing and savings deterministic makes the product easier to trust.  
**Blockers / what I'm stuck on:** Needed API keys and verified sender setup for production email delivery.  
**Plan for tomorrow:** Write tests around the audit engine and tighten questionable recommendation logic.

## Day 4 — 2026-05-29
**Hours worked:** 3  
**What I did:** Added audit-engine tests covering downgrades, credit opportunities, efficient spend, enterprise-plan review, Gemini overspend, and aggregate savings. Fixed a logic issue where active Cursor Pro usage could incorrectly be downgraded to Hobby.  
**What I learned:** Tests were most valuable where the recommendation sounded plausible but was financially wrong. The Cursor Pro/Hobby case made the audit more defensible.  
**Blockers / what I'm stuck on:** Needed to make the written pricing assumptions match the INR logic in code.  
**Plan for tomorrow:** Update pricing documentation, architecture notes, and business files.

## Day 5 — 2026-05-30
**Hours worked:** 2  
**What I did:** Updated `PRICING_DATA.md`, `ARCHITECTURE.md`, `TESTS.md`, `GTM.md`, `ECONOMICS.md`, `METRICS.md`, and `LANDING_COPY.md`. Documented the INR conversion assumption and the official pricing sources.  
**What I learned:** The business writeups matter as much as the code because this tool is a lead-generation product, not just a calculator.  
**Blockers / what I'm stuck on:** Still needed real user interviews and final deployment screenshots.  
**Plan for tomorrow:** Interview users and revise the product based on what they say.

## Day 6 — 2026-05-31
**Hours worked:** 2  
**What I did:** Conducted user interviews and updated `USER_INTERVIEWS.md` with direct quotes, surprising observations, and design implications. Rechecked the deployed app after environment variables were added.  
**What I learned:** Users care less about switching tools than I expected; many would rather keep their workflow and reduce cost through plan cleanup or credits.  
**Blockers / what I'm stuck on:** Needed final polish and GitHub Actions verification.  
**Plan for tomorrow:** Do final QA, Lighthouse check, README update, and submission cleanup.

## Day 7 — 2026-06-01
**Hours worked:** 2  
**What I did:** Ran final tests, lint, and production build. Confirmed GitHub Actions status, updated README with deployed URL and screenshots, checked the live Vercel URL, and prepared the Google Form submission.  
**What I learned:** The highest-risk parts of this assignment were not the UI, but proof of discipline: real interviews, git history, deployment, and defensible audit reasoning.  
**Blockers / what I'm stuck on:** No remaining engineering blockers.  
**Plan for tomorrow:** Submit the Google Form and monitor the deployed app in case reviewers hit an issue.
