# Reflection

## 1. Hardest bug

The hardest bug was not a TypeScript failure; it was a browser-only hydration issue caused by loading persisted form state from `localStorage` during the initial client render. My first hypothesis was that the numeric input changes had introduced a controlled/uncontrolled input warning, because the issue appeared after I changed number fields to text-mode numeric fields. I checked the in-app browser DOM and saw the Next.js issue overlay, then noticed the rendered form contained previously saved rows even though the server render only knew about the default single-row form. That pointed to a server/client markup mismatch. The fix was to initialize the form with a stable default value, then load `localStorage` after mount and only start writing back to storage once that load completed. I also kept the new storage key versioned so old dollar-denominated saved rows would not silently contaminate the rupee-based audit.

## 2. Decision reversed

I reversed the initial decision to treat this as a USD-first calculator with dollar formatting. That was fine for the original Credex prompt, but once the project needed to be suitable for India it became a product issue, not a cosmetic one. The lead thresholds, examples, tests, pricing data, email copy, Open Graph metadata, and public report all needed to speak in rupees. I moved the currency logic into a shared `money.ts` helper, converted the pricing model from `monthlyUsd` to `monthlyInr`, and documented the USD-to-INR conversion assumption in `PRICING_DATA.md`. The reversal made the code more coherent: the UI no longer formats one currency while the engine thinks in another, and the tests now assert rupee-denominated savings.

## 3. Week 2 plan

In week 2 I would build the import path that makes the audit dramatically more trustworthy: invoice upload and billing CSV parsing. Self-reported spend is good for a low-friction MVP, but founders often misremember whether a charge is per seat, workspace-wide, or API-only. The second thing I would add is benchmark mode for Indian startups: spend per engineer, spend per active AI-tool user, and API spend as a percentage of infrastructure spend. Third, I would replace the in-memory rate limit with Redis or a managed edge rate limiter and move lead follow-up into a queue. Finally, I would add a small admin view for Credex so high-savings reports can be triaged by vendor, monthly savings, and credit-fit reason.

## 4. AI tool usage

I used Codex to implement the Next.js app, audit engine, API routes, tests, and documentation. I trusted AI for scaffolding, code navigation, refactor mechanics, and first drafts of explanatory markdown, but I did not trust it with pricing math or the final behavioral checks. The audit recommendations are deterministic TypeScript rules with tests, not LLM output. One specific AI-assisted mistake I caught was the first version of the optimizer being too eager to recommend cheaper plans or alternatives just because they were lower cost. The tests exposed that Copilot Business could be downgraded too aggressively for multi-seat company use. I tightened the fit rules so individual/free plans are not treated as valid company replacements when team controls matter.

## 5. Self-rating

**Discipline: 7/10.** I kept the implementation scoped to the MVP and ran tests, lint, build, and browser checks, but the real 7-day git history and interviews still need actual calendar time.

**Code quality: 8/10.** The audit engine is isolated and tested, the currency logic is shared, and integrations are env-driven, though production rate limiting should move out of memory.

**Design sense: 7/10.** The UI is clear, screenshot-friendly, and not template-heavy, but it still needs deployed Lighthouse verification and real screenshots.

**Problem-solving: 8/10.** The project now handles INR localization, API failure fallback, public sharing, and the numeric input bug without weakening the core product.

**Entrepreneurial thinking: 7/10.** The GTM, economics, and metrics are specific to Credex-style lead generation, but real user interviews are still the missing source of truth.
