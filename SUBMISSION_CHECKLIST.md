# Submission Checklist

Use this before filling the Google Form.

## Code And Deploy

- [ ] Create the first real commit: `git add . && git commit -m "feat: build INR AI spend audit MVP"`
- [ ] Push to a public GitHub repository.
- [ ] Create Supabase project and run `supabase/schema.sql`.
- [ ] Add deployment environment variables from `.env.example`.
- [ ] Deploy on Vercel, Netlify, Render, or Cloudflare Pages.
- [ ] Put the live URL in `README.md`.
- [ ] Replace local screenshots or add a Loom/YouTube walkthrough link in `README.md`.
- [ ] Run Lighthouse on the deployed URL and confirm mobile scores: Performance >= 85, Accessibility >= 90, Best Practices >= 90.

## Required Verification

```bash
npm test
npm run lint
npm run build
git log --pretty=format:"%ad" --date=short | sort -u | wc -l
```

The final command must be at least `5` for the Credex rule.

## Human Evidence

- [ ] Add 7 honest entries to `DEVLOG.md`.
- [ ] Complete `USER_INTERVIEWS.md` from 3 real 10-15 minute conversations.
- [ ] Make commits on at least 5 distinct calendar days within the 7-day window.
- [ ] Update `REFLECTION.md` if any real events differ from the current draft.

## Google Form Items

- [ ] Public GitHub repo URL.
- [ ] Live deployed URL.
- [ ] Confirm all required root files exist.
- [ ] Confirm latest GitHub Actions CI check is green on `main`.
