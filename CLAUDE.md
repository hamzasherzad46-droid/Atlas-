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
4. Design: the observatory — an antique anatomical institution with an astronomical observatory. Dark is the signature: obsidian #171614 and charcoal #211F1B rooms, aged ivory #E8DDC5 type, antique brass #A88A54 for the instrument (wordmark seal, primary actions, progress, selection), muted copper #98664D for clinical notes, deep oxblood #542C30 sparingly (the 3D highlight is a lifted oxblood). Parchment #D8C9A9 for reference material (flashcards). Light mode is the same house as a manuscript page. Type: Libre Caslon Display (titles, structure names), Libre Caslon Text italic (Latin names, margin notes), Libre Franklin (reading), DM Mono (references, counts, clocks, bearings) — all bundled. Hairline rules, notes hung in the left margin, no cards. Celestial detail is real and sparse: the armillary seal, the Orion chart (J2000 positions), camera bearings. Each body system has a muted pigment key in `content/catalog.json` (`tint`). No blue or cyan, no gradients, no glow, no XP or gamified chrome. Tokens live in `src/styles/global.css`.
5. Mobile performance first: compressed GLB, lazy-load per module, pixel ratio ≤ 2.
6. No ads, analytics, social features or push notifications.
7. Keep diffs scoped to the task asked.

## Honesty
- Don't invent library APIs; check docs or existing code.
- Never claim a build/test passed without running it. Mark anything unrun as UNVERIFIED.
- Anatomy content must be accurate; flag anything you're unsure of.

## Git
- Small, clear commits. Never force-push or reset --hard.
- Ask before adding paid services or non-permissively licensed dependencies.

## Licensing
3D models from Z-Anatomy (CC BY-SA 4.0) / BodyParts3D (CC BY-SA 2.1 JP; the current skeleton is BodyParts3D 4.0 under CC BY 4.0). Keep the Credits screen attribution intact. Anatomical plates must be public domain (e.g. 19th-century engravings) or drawn for Atlas; never add images from modern publishers.

## Done means
Builds, lints, runs on a phone-sized viewport, and the quiz flow works end to end.

## Where things live
- `content/catalog.json` — courses → modules (status, content file, model file + transform)
- `content/<module>.json` — structures; optional `content/<module>.placeholder.json` — primitive stand-ins for modules without a GLB
- `content/catalog.json` `regions` — focused regional modules (skull, forearm, hand…) that `include` structure ids from a system's content file and reuse its model
- `content/curriculum.json` — every curriculum topic by category; `modules` only where an available module teaches the topic's core structures
- `content/plates.json` + `public/plates/` — labelled anatomical plates (arrow points in % of the image; check every point against the image before adding one)
- `content/mock.json` — mock-exam banks; first option is correct, the app shuffles
- `public/models/skeleton.glb` — real BodyParts3D bones, built by `scripts/import-bodyparts3d.mjs` (see README "3D models")
- `src/content/content.test.ts` — validates every content file (run `npm test` after editing content)
- `src/lib/` — pure logic: `typing.ts` (answer engine), `srs.ts` (spaced repetition), `meshMatch.ts`, `storage.ts`, `plates.ts` (tag layout), `mock.ts`, `sound.ts` (synthesised sounds)
- `src/state/` — Zustand stores: settings, progress (persisted), nav, quiz session
- `src/viewer/` — 3D: `AnatomyViewer` (lazy chunk), `ModelInstance`, `highlight.ts`, `CameraRig`, `placeholder.ts`
- `src/quiz/` — quiz screen, answer word, keyboard, summary; `src/screens/` — tabs, `Plates.tsx`, `MockScreen.tsx`
