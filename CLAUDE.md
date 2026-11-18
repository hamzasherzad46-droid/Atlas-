# Project Atlas — CLAUDE.md

## What this is
Mobile-first PWA anatomy trainer for nursing & medical students. Typing-based quiz over 3D models (Monkeytype × anatomy atlas). Prototype stage.

## Stack
Vite + React + TypeScript, three.js via @react-three/fiber + drei, Zustand, localStorage (behind a storage interface). Content in /content/*.json, models as GLB in /public/models.

## Commands
- npm run dev / npm run build / npm run lint / npm test

## Golden rules
1. Read existing code before writing; mirror existing patterns.
2. Content is data-driven — never hard-code questions in components.
3. New modules (Heart, Vessels, Muscles) = new JSON + models only, no code forks.
4. Design: the anatomy theatre, a Victorian medical museum. It should feel made by a careful product studio, never generated: plain copy, real engravings, real recorded sounds (see AI-TELLS-AUDIT.md). Dark is the signature: obsidian #171614 and charcoal #211F1B rooms, aged ivory #E8DDC5 type, antique brass #A88A54 for the instrument (primary actions, progress, selection), muted copper #98664D for clinical notes, deep oxblood #542C30 sparingly (the 3D highlight is a lifted oxblood). Parchment #D8C9A9 for reference material (flashcards). Light mode is the same house as a manuscript page. Type: Source Serif 4 (titles and structure names, optical sizes; italic for Latin names and margin notes) and Source Sans 3 (everything read quickly, and numbers in tabular figures) — both bundled; no monospace. One type scale only: 34 / 24 / 18 / 16 / 13 px (`--fs-1`…`--fs-5`, plus `--fs-hero` for a results score); spacing on a 4 px grid (`--s-*`); corners `--radius` (2 px; numbered marks are round); motion 150–250 ms ease-out (`--fast`/`--mid`/`--slow`), no bounce, reduced motion respected. Hairline rules, notes hung in the left margin, no cards. Each screen has one focal point and one primary action. The armillary seal appears only on onboarding and the app icon; imagery is the real 19th-century engraved plates, never generated decoration. Each body system has a muted pigment key in `content/catalog.json` (`tint`). No blue or cyan, no gradients, no glow, no XP or gamified chrome. Tokens live in `src/styles/global.css`; no hard-coded colours (Google's sign-in button and three.js light values are the named exceptions).
5. Mobile performance first: compressed GLB, lazy-load per module, pixel ratio ≤ 2.
6. No ads, analytics, social features or push notifications.
7. Keep diffs scoped to the task asked.

## Honesty
- Don't invent library APIs; check docs or existing code.
- Never claim a build/test passed without running it. Mark anything unrun as UNVERIFIED.
- Anatomy content must be accurate; flag anything you're unsure of.

## Git
- Small, clear commits. Never force-push or reset --hard.
- Ask before adding paid services or non-permissively licensed dependencies. (Approved: cspell, including its bundled common-misspellings list under CC BY-SA 4.0, development only.)

## Licensing
3D models from Z-Anatomy (CC BY-SA 4.0) / BodyParts3D (CC BY-SA 2.1 JP; the current skeleton is BodyParts3D 4.0 under CC BY 4.0). Keep the Credits screen attribution intact. Anatomical plates must be public domain (e.g. 19th-century engravings) or drawn for Atlas; never add images from modern publishers.

## Done means
Builds, lints, runs on a phone-sized viewport, and the quiz flow works end to end.

## Where things live
- `content/catalog.json` — body systems → modules (status, content file, model file + transform)
- `content/<module>.json` — structures; optional `content/<module>.placeholder.json` — primitive stand-ins for modules without a GLB
- `content/catalog.json` `regions` — focused regional modules (skull, forearm, hand…) that `include` structure ids from a system's content file and reuse its model
- `content/courses.json` — the courses (the `track` setting): per course, in priority order, its modules (focus, system), regions, curriculum categories, featured topics, plates, mock-exam topics and note order; plus `focus` modules (small sets of structures from one module, built like regions). A new course is JSON only; `npm test` checks every reference. Never hard-code course content in components
- `content/curriculum.json` — every curriculum topic by category, each with `summary` and `points` (study notes, British spelling); `modules` only where an available module teaches the topic's core structures
- `content/plates.json` + `public/plates/` — labelled anatomical plates (arrow points in % of the image; check every point against the image before adding one)
- `content/mock.json` — mock-exam banks; first option is correct, the app shuffles
- `public/models/skeleton.glb` — real BodyParts3D bones, built by `scripts/import-bodyparts3d.mjs` (see README "3D models")
- `public/models/body-*.glb` — whole-body layers (skin, muscles, arteries, veins, nervous, glands) from `scripts/layers/*.json`; layer list in `src/lib/bodyLayers.ts`
- `src/content/content.test.ts` — validates every content file (run `npm test` after editing content); `consistency.test.ts` — one name, Latin name and answer set per structure, no answer shared by two structures
- Spelling: `npm test` runs cspell first (British English, `cspell.config.json`): content, `en.ts`, README, NAVIGATION, CLAUDE. Word lists: `cspell-words.txt` (anatomy, Latin, eponyms), `cspell-answer-words.txt` (typed answers only), `cspell-dev-words.txt` (docs only). `src/content/spelling.test.ts`: synonyms may be American, display text may not. Never add a word just to pass; if unsure, list it in `CONTENT-REVIEW.md`
- `CONTENT-REVIEW.md` — content questions for a clinician or anatomist (TA2 names, questioned synonyms, mock nuances, note coverage); nothing in it was changed silently
- `TRANSLATION-REVIEW.md` — generated list of missing or out-of-date translations (`npm run i18n:report`); `npm test` fails if it is stale. Don't edit the six other languages without a native speaker. Only English is offered for now (`OFFERED_LANGS` in `src/state/settings.ts`); the others are hidden until reviewed
- `src/lib/` — pure logic: `typing.ts` (answer engine), `srs.ts` (spaced repetition), `meshMatch.ts`, `storage.ts`, `plates.ts` (tag layout), `mock.ts`, `sound.ts` (synthesised sounds), `haptics.ts` (Android vibration, follows the Sounds switch), `motion.ts` (reduced motion), `search.ts` (spelling-tolerant search; index built by `src/content/searchIndex.ts`)
- `src/state/` — Zustand stores: settings, progress (persisted), nav (a history of views: open screens with `go`/the `open*` actions, leave them with `goBack()`, never by resetting fields), quiz session; `browserBack.ts` keeps browser history in step; `navMemory.ts` reopens the last screen after a reload (a quiz in progress reopens where it was started); `scrollMemory.ts` gives each page its own scroll; `modelLoads.ts` reports real model download progress (`components/ModelLoading`)
- `NAVIGATION.md` — click paths from Today, one name per feature, touch-target exceptions; `scripts/check-navigation.cjs` proves them (Playwright, dev server running). Every full-screen view uses `components/ScreenBar`
- `src/styles/contrast.test.ts` — WCAG AA contrast of the colour tokens in both themes; change a token and `npm test` checks it
- Accounts (optional; Firebase email + Google): `src/account/` — `config.ts` (VITE_FIREBASE_* build variables; none = no accounts), `firebase.ts` (the only file that imports the SDK; a lazy chunk), `account.ts` (sign-in state, actions, error messages), `sync.ts` (when to sync); merge rules in `src/lib/syncMerge.ts`. One Firestore document per user, `users/{uid}`, guarded by `firestore.rules`. README "Accounts and sync" has the setup and `scripts/check-sync.cjs` the emulator test. Never add Firebase Analytics
- Imagery: `public/plates/covers/` — module covers and empty-state art, cut from the plates by `scripts/engravings.py` (a module's `cover` in catalog.json or courses.json; only where a plate truly shows its anatomy); `components/Engraving` prints them on `--engraving-paper`. App icons, favicon, iOS launch screens (`public/splash/`) and the share image come from `public/icons/icon.svg` via `scripts/brand-assets.cjs`
- `src/viewer/` — 3D: `AnatomyViewer` and `BodyViewer` (lazy chunks), `ModelInstance`, `highlight.ts`, `CameraRig`, `parts.tsx` (lights, pinned label), `placeholder.ts`
- `src/quiz/` — quiz screen, answer word, keyboard, summary; `src/screens/` — tabs, `Plates.tsx`, `MockScreen.tsx`, `BodyScreen.tsx`, `TopicScreen.tsx`
