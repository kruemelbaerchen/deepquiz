# DeepQuiz

A 1-on-1 **duel** game about how well friends really know each other (Quizduell meets "36 questions"). Each round you answer questions about yourself *and* guess how your opponent answered — **first to 3 round-wins** takes the match. Accounts, leaderboards, head-to-head records.

> **Live:** https://kruemelbaerchen.github.io/deepquiz/

## Architecture (short)

- **Frontend:** a single static file, `prototype/index.html` (HTML + CSS + vanilla JS, no build step). Hosted on **GitHub Pages**.
- **Backend:** **Supabase** (Postgres + Auth) via `@supabase/supabase-js` (CDN).
- **Auth:** username + password (a hidden synthetic email is derived from the username — no email step).
- **Tables:** `profiles`, `self_answers`, `duels`, `rounds`. SQL in `backend/` (`schema.sql` → `schema_v2_duels.sql` → `schema_v3_inround_answers.sql`).
- The `anon` key in the code is **public & safe** (Row Level Security guards the data). Never commit the `service_role` key.

## How it plays

- Sign up → home (no onboarding). Challenge a friend: recent opponents, username search, or a **share link**.
- A duel = first to 3 round-wins. Each round = 3 questions; both players answer about themselves and guess the other (interleaved). The round resolves once both have played → per-question reveal, both directions.
- **Invite link:** you answer 3 questions → they're encoded into the link itself (`#c=…`). A friend opens it, plays round 1, and registers (or, if already logged in, starts the match directly) — it becomes a real duel.

## Run locally

```bash
cd prototype
python -m http.server 4599   # open http://localhost:4599
```

Talks to the live Supabase — use throwaway test accounts and don't wipe data (real friends play).

## Contributing

- `main` auto-deploys to the live site — **never push broken code to `main`.** Work on a branch → PR → merge.
- Everything is in one `index.html`; coordinate to avoid merge conflicts.
- **New here? Read `WELCOME_BAPTISTE.md`** — full onboarding (architecture, local setup, gotchas, Supabase access, first tasks).

## Repo layout

```
prototype/index.html            ← the whole app (this is what's deployed)
prototype/Questions_EN.md        ← question pool reference
prototype/DEPLOY.md
backend/schema.sql               ← profiles (base)
backend/schema_v2_duels.sql      ← duels, rounds, self_answers
backend/schema_v3_inround_answers.sql  ← adds rounds.a_self/b_self
backend/cleanup_testdata.sql     ← surgical: removes only test accounts
WELCOME_BAPTISTE.md              ← start here if you're new
```
