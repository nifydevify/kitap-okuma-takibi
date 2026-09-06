# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

"Kitap Okuma Takip" is a working Progressive Web App for tracking reading progress across any book (built initially for tracking Risale-i Nur reading, but generic). Fully offline via IndexedDB (Dexie.js), with optional Google sign-in + Firestore sync across devices. Deployed to GitHub Pages at https://nifydevify.github.io/kitap-okuma-takibi/, auto-deployed on push to `main` via `.github/workflows/deploy.yml`. No test runner is configured.

Two project-scoped subagents exist at `.claude/agents/` (`kitap-takip-dev`, `kitap-takip-reviewer`) with detailed domain context — prefer them over generic agents for feature work or review on this repo.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check via `tsc -b` (project references, no emit) then produce a production build with `vite build`. **Always run this plus `npm run lint` before considering any change done** — both must be clean.
- `npm run lint` — run ESLint over the repo
- `npm run preview` — serve the production build locally

## Architecture

- No router: `App.tsx` switches between screens with plain `useState` (a bottom tab bar + a `selectedBookId` for the book-detail view). This is deliberate — GitHub Pages is static hosting and history-mode routing 404s on refresh.
- `src/db/` — the only layer allowed to touch Dexie tables directly (`db.ts` schema/seed, `books.ts`, `sessions.ts`, `settings.ts`, `backup.ts`, `validation.ts`, `computed.ts`). UI components always go through these functions.
- `src/hooks/` — reactive reads via `dexie-react-hooks`' `useLiveQuery` (`useBooks`, `useSessionsForDate/Month/Book`, `useDarkMode`, `useCloudSync`).
- `src/components/screens/` — the four tabs (Home, MonthlySummary, MyBooks, Settings) plus BookDetail; `components/{books,home,sessions,settings,ui}/` hold their sub-pieces.
- `src/firebase/` — optional cloud sync layer (`config.ts`, `auth.ts`, `sync.ts`). Entirely inert if `.env.local` has no `VITE_FIREBASE_*` values (`isFirebaseConfigured` gates everything) — the app must keep working purely offline in that case.
- `src/utils/` — `date.ts` (always local-time formatting, never `toISOString()` — avoids day-shift bugs) and `sessionOrder.ts` (the one chronological-sort comparator, shared by `db/sessions.ts` and `hooks/useSessions.ts`).

## Data model (`src/types/index.ts`)

- **Book**: `id, name, totalPages, frontMatterPages, color, currentPage`.
  - The UI only ever asks for "başlangıç sayfası" (→ `startingPage = frontMatterPages + 1`) and "bitiş sayfası" (`totalPages`) — never "toplam sayfa" + "önsöz sayfası" as two separate raw inputs; `frontMatterPages` is derived (`start - 1`) in `BookForm.tsx`. Don't reintroduce the two-raw-fields version — it was explicitly rejected once.
  - `effectivePages`, `startingPage`, `progressPages`, `progressPercent`, `remainingPages` are all computed in `db/computed.ts`, never persisted.
- **ReadingSession**: `id, bookId?, date (YYYY-MM-DD), startTime?, endTime?, startPage?, endPage?, pageCount?, note?, createdAt`.
  - `bookId` is **optional**: undefined means a "serbest okuma" (free reading) record not tied to any book — uses `pageCount` instead of `startPage`/`endPage`. Do not model this as a separate pseudo-book (that design was built once and explicitly reverted — see git history around "Serbest Okuma kitabı yerine gerçek serbest okuma kaydı").
  - `pagesRead` (computed): `endPage - startPage` when `bookId` is set, else `pageCount`.
  - `startTime`/`endTime` still exist in the schema and are displayed if present, but `SessionForm.tsx` (the "Yeni kayıt" add form) no longer collects them — native `<input type="time">` on iOS Safari doesn't respect its container width and repeatedly broke mobile layout (overlapping/overflowing boxes) across several fix attempts. Don't re-add time inputs to that form without testing on real iOS Safari first.

## Business rules that must not regress

- A session's `startPage` can never be below the book's `startingPage` (front-matter pages don't count as read) — `db/validation.ts: validateSessionPages`. This exists because of a real user-data bug (front matter pages leaking into monthly totals).
- `frontMatterPages`/`pageCount`/etc. can legitimately be `0` — never use `value || fallback` patterns on them (that treats a valid `0` as unset); this has bitten the codebase before.
- After adding/editing/deleting a session, `db/sessions.ts: recomputeBookCurrentPage` re-sorts that book's sessions chronologically (`utils/sessionOrder.ts`) and sets `currentPage` to the last one's `endPage`. If a book has zero sessions left, `currentPage` is left untouched (don't reset it — that would silently discard a manual correction).
- Any Firestore write in `src/firebase/sync.ts` must go through `stripUndefined` (JSON round-trip) first — Firestore's `setDoc` throws on `undefined` field values, and `ReadingSession`'s optional fields are frequently `undefined`.
- `startCloudSync`'s echo-loop guard (`lastSynced` serialized-string comparison) must stay intact when touching sync. It also tracks a `hasPendingLocalChange` flag: an incoming remote snapshot is skipped (not applied) while a local change is still debounced/unpushed, so a same-device edit isn't clobbered by `applyCloudToLocal`'s full clear+bulkAdd. Don't remove either guard.
- `db/backup.ts: importBackup` treats the uploaded file as fully untrusted input: `isValidBookEntry`/`isValidSessionEntry` validate every field's type before it touches Dexie (a prior version only checked that `books`/`sessions` were arrays). Book de-duplication on import matches on name **and** `totalPages`/`frontMatterPages` together (`bookMatchKey`) — matching on name alone previously merged two different books that happened to share a title.
- `BookForm.tsx` blocks saving an edited book if the new page range would no longer cover that book's existing sessions (`db/sessions.ts: getBookSessionPageBounds`) — prevents silently leaving historical sessions outside the book's valid range.

## Visual design

Minimal/neutral design system: `zinc` (not `slate`) is the neutral palette, `amber` is the *only* accent color and is used sparingly (the big page-count numbers on Home/MonthlySummary, the active bottom-nav dot, the session-edit highlight) — don't reintroduce `indigo`/`slate` or add other accent colors without reason. Body font is Inter, big numbers/headings use the `.font-display` class (Fraunces, loaded via Google Fonts in `index.html`). `Card` (`components/ui/Card.tsx`) has no shadow by design (border-only, generous padding) — that's intentional, not a missed style.

Settings has an "Uygulamayı yenile" (hard refresh) button: PWA mode has no accessible browser refresh, so it clears service-worker caches and unregisters the SW before reloading. Keep this working if touching the SW/PWA config.

## Cloud sync flow (when Firebase is configured)

First sign-in on a device+account combo: compare local Dexie data vs. the account's Firestore doc and ask the user "bu cihazın verisini mi, buluttaki veriyi mi kullanmak istiyorsun" (`CloudSyncCard`, `useCloudSync`). The choice is stored in `db.settings.cloudSyncAccount`; after that, sync is silent and continuous (Dexie table hooks debounce-push local changes, Firestore `onSnapshot` pulls remote ones). Firebase project id is `kitap-okuma-takibi`; real keys live only in the untracked `.env.local` (see `.env.example`) and in the repo's GitHub Actions secrets (needed for the Pages build); `firestore.rules` restricts each doc to its own uid.
