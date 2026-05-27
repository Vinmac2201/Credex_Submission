# User Interviews

These were asynchronous public Reddit feedback conversations on 2026-05-27 from a post asking developers and side-project builders how they track AI-tool spend. They are not phone calls; I am documenting them honestly because the assignment explicitly penalizes fabricated interviews.

## Interview 1 — Plastic-Brother-265

**Role / company stage:** Reddit respondent in r/SideProject; individual developer/side-project builder using paid AI tools.  
**Date:** 2026-05-27  
**Context:** Public Reddit comment on my AI-spend audit post.

**Direct quotes:**
- "I track it loosely mostly Claude Pro + Cursor."
- "~$40/month out of pocket."
- "Honestly haven't audited it properly, which is probably your point."
- "Would trust a tool more if it showed me exactly where I could save without just telling me to downgrade everything."

**Most surprising thing:** The respondent was not opposed to auditing, but they were explicitly skeptical of lazy downgrade advice. This matched the bug I later saw in the app where Cursor Pro could be incorrectly downgraded to Hobby.

**What changed about the design:** I tightened the audit engine so free plans are not recommended for active paid usage. I also reframed high-spend paid-plan mismatches as "review list-price billing" instead of pretending the answer is always downgrade.

## Interview 2 — gobhalla

**Role / company stage:** Reddit respondent in r/SideProject; likely operator/developer familiar with accounting workflows.  
**Date:** 2026-05-27  
**Context:** Public Reddit comment challenging whether the product should duplicate bank/accounting transaction data.

**Direct quotes:**
- "You can get all the information in your bank in transactions."
- "Just to link any of the banking platforms like Zoho Books or QuickBooks."
- "You can get all the details for all the tools where you are spending."

**Most surprising thing:** The strongest critique was not about the audit recommendation logic; it was about manual data entry. The comment made it clear that raw spend discovery is already handled better by bank/accounting systems.

**What changed about the design:** I added accounting import as a week-2 direction in my thinking. The MVP still asks for manual spend because it reduces integration friction, but the product should eventually sit on top of Zoho/QuickBooks/bank data and focus on interpretation: plan fit, alternatives, and credit opportunities.

## Interview 3 — nocturnalbagell

**Role / company stage:** Reddit respondent in r/SideProject; builder tracking AI spend manually.  
**Date:** 2026-05-27  
**Context:** Public Reddit comment describing their current spend-tracking workflow.

**Direct quotes:**
- "I track it monthly in a simple sheet with three buckets."
- "Subscriptions, usage based API costs, and one off experiments."
- "The useful part is cost per actual outcome, not raw dollars."
- "A trustworthy audit should show assumptions clearly and compare keep, downgrade, and cancel scenarios with confidence ranges."

**Most surprising thing:** The phrase "cost per actual outcome" was the sharpest product feedback. It suggests that spend alone is not enough; users want to know whether the tool produces enough value to justify keeping it.

**What changed about the design:** I would add benchmark mode and confidence ranges next. The current MVP already shows assumptions and recommendation reasons, but a stronger version would compare keep/downgrade/cancel scenarios and let users attach outcomes such as merged PRs, research reports, or API-powered customer actions.
