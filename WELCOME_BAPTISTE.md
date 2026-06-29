# 👋 Welcome to DeepQuiz, Baptiste!

David's building a social duel game and you're jumping in — nice. This gets you from zero to running it locally and making your first change. Read it once, top to bottom (~6 min). It's up to date as of the current build.

> **Live:** https://kruemelbaerchen.github.io/deepquiz/

---

## What DeepQuiz is

A 1-on-1 **duel** game about how well friends know each other (Quizduell meets "36 questions"). In a duel, each round you **answer questions about yourself AND guess how your opponent answered**. Whoever guesses better wins the round. **First to 3 round-wins** takes the match. There are leaderboards and head-to-head records.

## The whole thing in one breath (architecture)

- **Frontend:** a *single file* — `prototype/index.html`. Plain HTML + CSS + vanilla JS, **no framework, no build step**. This is the entire app. Hosted on **GitHub Pages**.
- **Backend:** **Supabase** (hosted Postgres + Auth), reached from the browser via `@supabase/supabase-js` (CDN `<script>` in the `<head>`).
- **Auth:** *username + password*, no email. Under the hood we derive a hidden synthetic email (`u<hash>@deepquizplayers.com`) from the username, so there's no email step or rate limit.
- **No secrets in the repo.** The Supabase **`anon` key** in `index.html` is public by design — Row Level Security (RLS) protects the data. The **`service_role`** key must NEVER be committed or shared.

## Data model (Supabase, 4 tables)

| Table | Holds |
|---|---|
| `profiles` | one row per user (`id`, `username`) |
| `self_answers` | a user's own answers (`user_id`, `question_id`, `answer`) — feeds the "who knows me best" leaderboard + link challenges |
| `duels` | a match: `a`, `b` (players), `a_name`, `b_name`, `wins_a`, `wins_b`, `status`, `winner` |
| `rounds` | a round: `question_ids[]`, `a_self`/`b_self` (each player's own answers), `a_guesses`/`b_guesses` (their guesses of the other), `a_correct`/`b_correct`, `winner` |

SQL lives in `backend/`: `schema.sql` (profiles) → `schema_v2_duels.sql` (duels, rounds, self_answers) → `schema_v3_inround_answers.sql` (adds `rounds.a_self`/`b_self`). All already applied to the live project. (`challenges`/`plays` tables are leftovers from an old version — unused, safe to drop.)

## Run it locally (30 seconds)

```bash
cd prototype
python -m http.server 4599   # then open http://localhost:4599
```

No build. Login works on `localhost` (it counts as a secure context, needed for the username→hash crypto). It talks to the **same live Supabase** as production, so **use throwaway test accounts** while developing (e.g. `TestBaptiste1`) and don't wipe data — real friends already play.

## How a duel actually flows (so the code makes sense)

1. **Sign up → home.** No onboarding.
2. **Challenge** a friend: tap a recent opponent, search a username, or **share a link**.
3. **A round = 3 questions.** For each: you answer about *yourself*, then guess your opponent — interleaved ("verschränkt"). No reveal yet.
4. The round **resolves when both players have played** → both see the per-question reveal (your guess vs their answer, both directions). First to 3 round-wins.
5. Past rounds are **tappable** in the match view to re-see the details.

### The invite-link flow (the subtle part)
- You tap **"Answer 3 & get my link"** → answer 3 questions → those 3 questions+answers get **encoded into the link itself** (`#c=<base64>`), via `enc()`/`dec()`. So a link can only exist if you deliberately answered — no phantom challenges.
- A friend opens the link → plays round 1 (answers the same 3 about themselves + guesses you) → sees their score → if not logged in, they **register**; if logged in, they tap "Start the match".
- That creates the real duel (`finalizeChallenge`). **The opener becomes player `a`** — important: RLS requires the row's creator to be `a` (`auth.uid() = a`), and the opener is the one inserting. The link creator is `b`, with their round-1 self-answers pre-filled; they "play round 1" by **only guessing** (their self is already in).

## Code map (sections in `index.html`)

One file, but sectioned with `// =====` banners:
`CONFIG` → `QUESTION POOL` (the `Q` array, 56 questions) → `helpers` (`enc/dec`, `scoreOne`, `answerText`, …) → `AUTH` → `HOME` → `CHALLENGE / INVITE` (`challengeScreen`, `searchUsers`, `setupLink`, `linkReady`) → `GUEST` (`guestPlay`, `gpResult`, `finalizeChallenge`) → `DUEL` (`openDuel`, `matchScreen`, `dgStart`, `dgSubmit`, `computeResolve`, `roundResult`, `duelResult`) → `LEADERBOARD` → shared input renderer.

**Editing questions** = just edit the `Q = [...]` array near the top. Format: `binary`, `mc`, `slider`. Human-readable list: `prototype/Questions_EN.md`.

## Gotchas / things that will bite you if you don't know them

- **"Whose turn is it" is checked via GUESSES, not self-answers** (`a_guesses`/`b_guesses`). Round 1 of a link can have a player's `self` filled but `guesses` not — so self can't be the "done" signal.
- **Wins are recomputed from the rounds** (`computeResolve` counts round winners), never `+1`. Keeps it correct even if a round resolves twice.
- **Anti-cheat:** no result is shown mid-round; guesses lock when the round is submitted; restarting can't help. (A determined dev could still decode answers from the link/DB — honor-system for friends; real fix = server-side scoring later.)
- **RLS is the only thing protecting data** (the anon key is public). If a write mysteriously fails, check the RLS policy in the relevant `backend/*.sql`.

## Contributing workflow

- `main` **auto-deploys to the live site** on every push. **Never push broken code to `main`.**
- Work on a **branch**, test locally, open a **Pull Request**, merge when green.
- It's one big `index.html`, so **coordinate with David** to avoid merge conflicts (split by area, or we split the file into `index.html`/`style.css`/`app.js` once two of us are active).

## Good first tasks

1. **Add questions** — safest, most useful first PR. The #1 thing the app needs (avoids repetition). Add to the `Q` array + `Questions_EN.md`.
2. **Small UX polish** — nicer empty states, the "waiting for opponent" screen, copy.
3. Once comfortable: help with **"your turn" notifications** — the biggest missing feature (async duels need a nudge). Likely Web Push via a Supabase Edge Function; note iOS needs "Add to Home Screen" for web push to work.

## Getting access

- **Frontend work needs nothing extra** — clone, run locally, go.
- **Supabase dashboard** (to see the DB / run SQL): ask David to add you as a project member. Tip: spin up a separate `deepquiz-dev` Supabase project for experiments so you never touch live data — just swap `SUPABASE_URL`/`SUPABASE_ANON_KEY` at the top of `index.html`.

## Known limitations (so you don't think they're your bug)

- **No notifications yet** — you learn it's your turn by opening the app (home shows "Your turn").
- **No password reset** (no email on file).
- Honor-system anti-cheat (see gotchas).
- Real users are live in the DB — don't run a blanket data wipe; there's a surgical `backend/cleanup_testdata.sql` that only removes test accounts.

Welcome aboard — have fun with it. 🚀
