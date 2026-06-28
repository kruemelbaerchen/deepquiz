# DeepQuiz

A 1-on-1 **duel** game about how well friends really know each other (Quizduell meets "36 questions"). You answer questions about yourself; friends guess your answers and duel you — **first to 3 round-wins** takes the match. Accounts, leaderboards, head-to-head records.

> **Live:** https://kruemelbaerchen.github.io/deepquiz/

## Architecture (short version)

- **Frontend:** a single static file, `prototype/index.html` (HTML + CSS + vanilla JS, no build step). Hosted on **GitHub Pages**.
- **Backend:** **Supabase** (Postgres + Auth) via `@supabase/supabase-js` (CDN).
- **Auth:** username + password (a hidden synthetic email is derived from the username — no email step).
- **Tables:** `profiles`, `self_answers` (your "about me" bank), `duels`, `rounds`. SQL in `backend/`.
- The `anon` key in the code is **public & safe** (Row Level Security guards the data). Never commit the `service_role` key.

## Run locally

```bash
cd prototype
python -m http.server 4599   # open http://localhost:4599
```

## Contributing

- `main` auto-deploys to the live site — **never push broken code to `main`.** Work on a branch → PR → merge.
- Everything is in one `index.html`; coordinate to avoid merge conflicts.
- **New here?** Read **`WELCOME_BAPTISTE.md`** — full onboarding (architecture, local setup, Supabase access, first tasks).

## Repo layout

```
prototype/index.html         ← the whole app (this is what's deployed)
prototype/Questions_EN.md     ← question pool reference
prototype/DEPLOY.md
backend/schema.sql            ← base tables (profiles)
backend/schema_v2_duels.sql   ← duel tables (self_answers, duels, rounds)
backend/cleanup_testdata.sql
WELCOME_BAPTISTE.md           ← start here if you're new to the project
```
