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
4. Design: an anatomical reference book. Warm ivory paper and charcoal ink (dark mode: charcoal paper, ivory ink), one typeface (Libre Franklin, bundled) across many weights, hairline rules instead of cards, section labels hung in the left margin, Latin names in italic. Burgundy is the brand: wordmark, primary actions, progress, selection and the 3D highlight. Each body system has a muted colour key in `content/catalog.json` (`tint`). Status colours carry meaning only: green correct, red errors, amber attention, blue information. No gradients, rounded card stacks, rings, XP, levels or other gamified chrome. Tokens live in `src/styles/global.css`.
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
3D models from Z-Anatomy (CC BY-SA 4.0) / BodyParts3D (CC BY-SA 2.1 JP; the current skeleton is BodyParts3D 4.0 under CC BY 4.0). Keep the Credits screen attribution intact.

## Done means
Builds, lints, runs on a phone-sized viewport, and the quiz flow works end to end.

## Where things live
- `content/catalog.json` — courses → modules (status, content file, model file + transform)
- `content/<module>.json` — structures; optional `content/<module>.placeholder.json` — primitive stand-ins for modules without a GLB
- `public/models/skeleton.glb` — real BodyParts3D bones, built by `scripts/import-bodyparts3d.mjs` (see README "3D models")
- `src/content/content.test.ts` — validates every content file (run `npm test` after editing content)
- `src/lib/` — pure logic: `typing.ts` (answer engine), `srs.ts` (spaced repetition), `meshMatch.ts`, `storage.ts`
- `src/state/` — Zustand stores: settings, progress (persisted), nav, quiz session
- `src/viewer/` — 3D: `AnatomyViewer` (lazy chunk), `ModelInstance`, `highlight.ts`, `CameraRig`, `placeholder.ts`
- `src/quiz/` — quiz screen, answer word, keyboard, summary; `src/screens/` — tabs
