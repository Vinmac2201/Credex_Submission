# User Interviews

I was not able to complete three real 10-15 minute user interviews before submission. I chose not to fabricate interviews because the assignment explicitly says fabricated interviews are an instant rejection risk.

## What I Did Instead

I validated the product through pricing research, manual audit scenarios, deployment testing, and edge-case checks. I tested cases such as efficient spend, large API spend, enterprise-plan overspend, and incorrect free-plan downgrade recommendations. One important audit-logic issue I caught during testing was that Cursor Pro spend could be incorrectly downgraded to Hobby; I fixed this by preventing free-plan recommendations for active paid usage and adding a regression test.

## What I Would Ask In Real Interviews

If I had more time, I would speak with three startup founders, CTOs, or engineering managers who currently pay for Cursor, ChatGPT, Claude, Copilot, or API usage. I would ask:

1. Which AI tools are you paying for today, and who owns the bill?
2. How much do you estimate you spend each month?
3. Have you ever checked whether all paid seats are active?
4. Would you rather downgrade, switch tools, or keep the same tool and buy discounted credits?
5. What would make an automated audit feel trustworthy?
6. At what savings amount would you book a consultation?
7. What would make you ignore the recommendation?

## Expected Learning

My hypothesis is that most small teams do not want tool churn unless savings are very large. For moderate savings, they likely prefer plan cleanup. For large API or enterprise spend, discounted credits are probably more attractive because they preserve the current workflow.

## Submission Note

This is the largest gap in my submission. The product is deployed and technically functional, but I did not want to weaken the integrity of the application by inventing user quotes or fake conversations.
