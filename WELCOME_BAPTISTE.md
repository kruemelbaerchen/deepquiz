# 👋 Welcome to DeepQuiz, Baptiste!

David's building a social quiz game and you're jumping in — awesome. This doc gets you from zero to running the app locally and making your first change. Read it once, top to bottom (~5 min).

> **Live app:** https://kruemelbaerchen.github.io/deepquiz/

---

## What DeepQuiz is

A 1-on-1 **duel** game about how well friends know each other (think Quizduell meets "36 questions"). You answer questions about yourself; friends try to guess your answers. You duel them: **first to 3 round-wins** takes the match. There are leaderboards, head-to-head records, the works.

## The whole thing in one breath (architecture)

- **Frontend:** a *single file*, `prototype/index.html` — plain HTML + CSS + vanilla JS, **no build step, no framework**. This is the entire app. It's hosted on **GitHub Pages**.
- **Backend:** **Supabase** (hosted Postgres + Auth), reached from the browser via `@supabase/supabase-js` (loaded from a CDN — see the `<script>` in the `<head>`).
- **Auth:** *username-first*. People pick a username + password; under the hood we derive a hidden synthetic email (`u<hash>@deepquizplayers.com`) so there's **no email step** and no email-rate-limit pain.
- **No secrets in the repo.** The Supabase `anon` key in `index.html` is **public by design** (Row Level Security protects the data). The `service_role` key must **never** be committed or shared.

## Data model (4 tables, all in Supabase)

| Table | What it holds |
|---|---|
| `profiles` | one row per user (`id`, `username`) |
| `self_answers` | each user's "about me" answers — the bank friends guess |
| `duels` | a match between two users (players, win counts, status, winner) |
| `rounds` | each round of a duel: both players' guesses about each other, scores, round winner |

The SQL that creates these lives in `backend/schema.sql` (base) and `backend/schema_v2_duels.sql` (duels). They're already applied to the live project.

## Run it locally (30 seconds)

No install needed. From the `prototype/` folder:

```bash
python -m http.server 4599
# then open http://localhost:4599
```

Login works on `localhost` because it counts as a "secure context" (needed for the username→hash crypto). It talks to the **same live Supabase** as production, so be a little careful — use throwaway test accounts (e.g. `TestBaptiste1`) while developing.

## How the duel flow works (so the code makes sense)

1. **Sign up → onboarding:** you answer 12 fixed questions about yourself (`ONBOARDING` array). Everyone answers the same 12, so any two players share questions to duel on.
2. **Challenge:** pick a recent opponent (one tap), search a username, or send your optional invite link (`#play=<username>`). A guest can play a no-stakes *taster* before signing up.
3. **A round** = 3 questions; both players guess each other. Each guess is **committed to the server the instant you make it, then the answer is revealed** — that's the anti-cheat (you can't see an answer and then restart to re-guess it).
4. **Round winner** = more correct. **First to 3 round-wins** wins the duel. Then a full **both-directions reveal** + the head-to-head record.

## Where things are in `index.html`

It's one file but sectioned with `// =====` comment banners:
`CONFIG` → `QUESTION POOL` (the `Q` array) → `helpers` → `AUTH` → `ONBOARDING` → `HOME` → `CHALLENGE / INVITE` → `GUEST TASTER` → `DUEL` → `LEADERBOARD` → shared input renderer. Search for those banners.

**Adding/editing questions** = just edit the `Q = [...]` array near the top. Format: `binary`, `mc`, `slider`. Human-readable list: `prototype/Questions_EN.md`.

## Contributing workflow (important!)

- `main` is **auto-deployed to the live site** on every push. **Never push broken code to `main`.**
- Work on a **branch**, test locally, open a **Pull Request**, then merge.
- Everything's in one big `index.html`, so **coordinate with David** to avoid merge conflicts (split work by area, or we split the file into `index.html`/`style.css`/`app.js` once two people are active).

## Good first tasks (pick one to get your feet wet)

1. **Add questions** — the safest, most useful first PR. Add a few good ones to the `Q` array (and `Questions_EN.md`). More questions = less repetition = the #1 thing the app needs.
2. **Small UI polish** — e.g. nicer empty states, a friendlier "waiting for opponent" screen.
3. Once comfortable: help with **"your turn" notifications** (the next big feature — web push).

## Known rough edges (so you don't think they're your bug)

- **No notifications yet** — you find out it's your turn by opening the app (the duel list shows "Your turn"). Push notifications are the planned next feature.
- **Honor-system anti-cheat:** the restart-cheat is fully blocked, but a determined dev could read answers via the browser console (answers live in the client to score). The clean fix is server-side scoring (a Supabase Edge Function) — a later hardening.
- **Optional concurrency hardening:** if you ever see duplicate rounds, add a DB constraint: `alter table public.rounds add constraint rounds_unique unique (duel_id, round_no);` (the code already tolerates the race; this makes it bulletproof).
- No password reset yet (no email on file), and `plays`/`challenges` tables are leftovers from the old one-way version (unused, safe to drop).

## Getting access

- **Frontend work needs nothing extra** — clone the repo, run locally, go.
- **Supabase dashboard access** (to see the DB / run SQL): ask David to add you as a project member. Tip: spin up a separate `deepquiz-dev` Supabase project for experiments so you never touch live player data — just swap `SUPABASE_URL`/`SUPABASE_ANON_KEY` at the top of `index.html`.

Welcome aboard — have fun with it. 🚀
