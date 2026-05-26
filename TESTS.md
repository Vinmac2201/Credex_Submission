# Tests

Run all tests:

```bash
npm test
```

## Automated Tests

- `src/lib/audit.test.ts` — downgrades a small Cursor Business team to Pro when INR-converted public plan pricing supports it.
- `src/lib/audit.test.ts` — flags large OpenAI API rupee spend for discounted credits and marks it as a Credex-tier lead.
- `src/lib/audit.test.ts` — keeps efficient GitHub Copilot Business spend when the invoice matches INR-converted public pricing.
- `src/lib/audit.test.ts` — prevents active Cursor Pro spend from being incorrectly downgraded to the free Hobby plan.
- `src/lib/audit.test.ts` — reviews enterprise plans when team size is below enterprise scale.
- `src/lib/audit.test.ts` — catches Gemini Ultra overspend for research teams.
- `src/lib/audit.test.ts` — verifies aggregate monthly and annual savings math across multiple tools.
