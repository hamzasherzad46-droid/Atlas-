# Atlas — anatomy trainer (prototype)

A typing-based anatomy trainer for nursing and medical students. A 3D model appears with one
structure highlighted in red; you type its name, letter by letter. Mobile-first PWA: runs in
iPhone and Android browsers and installs to the home screen.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # spelling (cspell, British English), then logic + content validation
npm run lint
npm run build && npm run preview   # production build with service worker
```

**Live:** https://hamzasherzad46-droid.github.io/Atlas-/ — published by `.github/workflows/pages.yml` on every push to `main`.

To try it on a phone on the same Wi-Fi: `npm run dev -- --host`, then open the printed network URL.
(Service workers need HTTPS or localhost, so offline mode and installation only work on a deployed build.)

**Sandboxed build** (`npm run build:artifact` → `dist-artifact/`): for hosts like a claude.ai artifact,
which serve only HTML/JS/CSS, block service workers and may block WebAssembly. It uses relative URLs,
inlines the fonts, has no service worker, and ships each model quantized (no Draco) inside a JS module
that is parsed in memory (`src/viewer/embeddedModel.ts`). Offline mode and home-screen install don't
apply there.

## What's in the prototype

- **Eight body systems, 249 structures, all on real BodyParts3D meshes**: skeleton (65, incl. individual
  carpals/tarsals, C1/C2/C7, teeth by type), muscles (52), heart (23), major vessels (32), airways (15),
  brain (31), digestive (17), urinary (7), male reproductive (7). Organ and muscle modules show a faint
  skeleton behind them for orientation.
- **Quiz**: learn mode (ghost letters + definition clue), medium (the first letter and about a quarter of the rest,
  plus the definition) or hard mode (dashes). Each structure is asked once per session, in an order that alternates
  body regions; misses are listed at the end to fix. A word is never finished for you: if a shorter accepted form
  ("delt", "metacarpal") is typed inside the displayed name, the quiz waits for the rest or for ↵. Level filter (foundation /
  intermediate / advanced); optional per-question timer (30/20/10 s; time-out = miss); exams with a whole-test
  clock and per-answer timer. Feedback shows the verdict, the Latin name, what the structure does and a track note.
- **Flashcards**: what it does, why it's there, and a note for your track; swipe to grade; own spaced repetition.
- **Four tabs**: Today (the course home: continue where you left off, today's study, Learn, Test, the course's
  modules and topics), All content (the body in 3D, short course modules, regions, systems, plates, the mock exam
  and every curriculum topic, all on one page), Progress (activity, days in a row, study plan, weak spots, timed and
  mock exams) and Settings. Each module page shows Learn (Explore in 3D, Flashcards), its test settings in view
  (questions from, difficulty, structures, time per answer) and Test (Spelling quiz, Multiple choice, Identify on the
  model), then Timed exam and Fix mistakes.
- **Search**: one search from the magnifier on every tab, over structures (name, other names, Latin), modules,
  topics, plates and mock-exam topics. British and American spellings find each other and small typos are
  forgiven; a structure result opens in 3D, selected and in view.
- **Navigation**: Back always returns to the previous screen, and the phone's back gesture does the same; every
  full-screen view has its Back or Close button top left. Click paths, checks and exceptions: `NAVIGATION.md`.
- **Focused regions**: Skull and hyoid, Teeth, Vertebral column, Thoracic wall, Bony pelvis, Shoulder girdle, Arm,
  Forearm, Wrist and hand, Thigh and knee, Leg, Ankle and foot. Each is defined in `catalog.json` as a list of
  structures from the skeleton; the rest of the skeleton stays faint and untappable, and limbs are framed on one side.
- **Explore as a plate**: numbered references sit on real surface points of each structure (group structures such as
  "carpals" are only numbered where no member structure covers them), with a key, a pinned label and the camera's
  azimuth and altitude.
- **Plates**: eleven labelled anatomical plates in All content (and each course's on Today) — ten 19th-century engravings (Bourgery and Jacob,
  Hirschfeld and Léveillé, and others) and an original diagram of a molar in section. Each has numbered arrows
  drawn from the margin to the structure, a key, a short note per structure and a "Test yourself" mode that hides
  the names. Arrow positions were checked one by one against the image; only structures that can be identified
  with confidence are labelled.
- **Mock exams**: Foundation (57 questions) and Higher (54 questions) banks of multiple-choice questions, asked 15,
  30 or 45 at a time with the options shuffled. Each answer is marked at once and explained; the results show the
  score by topic and every question to look at again, and are kept with the exam history in Progress. Started from
  Today or All content, from the course's topics or all of them, or on one topic from search.
- **Sound**: synthesised in the browser, no audio files — a two-note bell for a correct answer and a closing chord
  after a mock exam (Settings can turn sound off).
- **The body in 3D** (Today or Atlas): the whole BodyParts3D body in seven layers — skin, every muscle (442 meshes),
  bones, organs (heart, airways, digestive, urinary and reproductive organs, glands and eyes), arteries (639 meshes),
  veins (395 meshes) and the brain and nerves. Each layer loads only when switched on. Four views: Layers (peel from
  skin to bone), X-ray (skin and muscles see-through), Separate bones (pull the skeleton apart with a slider) and Cut
  (a transverse, coronal or sagittal section that moves with a slider). Tap any part to name it; parts that a module
  teaches show its notes and link to it; Isolate shows the part alone. BodyParts3D has no spinal or limb nerves, so
  the nerve layer shows the brain and the nerves of the eye.
- **Curriculum**: 282 topics in 21 categories (`content/curriculum.json`), each with a short definition and four or
  more key points at university level, in British spelling. 59 also link to the 3D modules that teach their core
  structures, and regional and systemic topics link to the 3D body.
- **Courses** (`content/courses.json`): Nursing, Medicine, Physiotherapy, Dentistry and Sports science. The first
  question on first run is "What are you studying?"; Today is the course's home page (continue where you left off,
  today's study, learn, test, the course's modules and topics, and a link to all content), and "Change course" is one
  tap from Today and keeps all progress. Each course has its own order of modules, focus modules (for example Nursing:
  injection sites, pulse points, cannulation veins, central venous access, urinary tract and catheterisation), topics,
  plates and mock-exam topics, and shows its own note on each structure first. A new course is JSON only.
- **Languages**: the interface is offered in English only for now. French, German, Arabic (right-to-left),
  Russian, Chinese and Korean translations are in the code but hidden until a native speaker has reviewed
  them (`TRANSLATION-REVIEW.md`); to offer one again, add it to `OFFERED_LANGS` in `src/state/settings.ts`.
  A student who had chosen one sees English, and their choice comes back when the language does.
  Anatomy content (names, definitions, notes) is English; answers are typed in English or Latin.
- **Design**: the observatory — an antique anatomical institution with an astronomical observatory. Obsidian and
  charcoal with aged-ivory Caslon type and brass instrument details (dark is the signature; light is a manuscript
  page), parchment flashcards, an armillary-sphere seal and an engraved Orion chart drawn from real star positions.

### Known data gaps (BodyParts3D 4.0)

No lung surfaces (lungs are shown by their segmental airway trees), no spinal cord or limb nerves, no
masseter/temporalis/latissimus dorsi/rectus abdominis or facial muscles, no female reproductive organs,
no sigmoid colon or caecum, and no coccyx (an approximate one is added). The liver surface comes from
open-anatomy-3d (CC BY 4.0). Translations and clinical notes need review by native speakers and clinicians.

## Content (data-driven)

All questions live in `/content`. Nothing is hard-coded in components.

| File | Purpose |
| --- | --- |
| `catalog.json` | Courses → modules: title, `status` (`available` / `coming-soon`), content file, model file + transform |
| `skeleton.json` | Regions and structures |
| `skeleton.placeholder.json` | Primitive stand-in shapes used until the GLB exists |
| `courses.json` | Courses and their focus modules, in priority order (see "Courses" above) |
| `plates.json` | Anatomical plates: image, view, source, and arrows (`x`/`y` in % of the image, `name`, `note`) |
| `mock.json` | Mock-exam banks (`foundation`, `higher`): `topic`, `q`, four `options` (the first is correct; shown shuffled), `explain` |

Each structure:

```json
{
  "id": "clavicle", "name": "clavicle", "synonyms": ["collarbone", "collar bone"],
  "latinName": "clavicula",
  "definition": "One sentence. Must not contain the answer — it is shown as a clue in learn mode.",
  "notes": { "nursing": "…", "medicine": "…" },
  "region": "upper-limb", "modelFile": "skeleton.glb",
  "meshName": "clavicle",
  "camera": { "position": [-0.2, 1.5, 0.6], "target": [-0.08, 1.41, 0.03] },
  "difficulty": 1
}
```

- Answers and synonyms: lower-case letters and spaces only (that's what the keyboard has).
- `meshName` may be a string or an array. Matching ignores case and punctuation and allows side or
  index suffixes, so `"humerus"` matches `Humerus.l`, `Humerus_R`, `humerus2`. (three's GLTFLoader
  strips `.` from node names, so `Humerus.l` arrives as `Humerusl`; the matcher handles that.) <!-- cspell:ignore Humerusl -->
- Coordinates are "atlas space": metres, Y up, the body faces +Z, feet at y = 0. So the body's
  **right** side is −X.
- `npm test` validates every content file: required fields, typeable answers, no answer leaked in
  the definition, no answer shared by two structures, every `meshName` present in the placeholder.
- **Spelling**: `npm test` first runs `cspell` over the content, the English interface strings and these
  documents in British English (`cspell.config.json`); an unknown word fails the build. Anatomy, Latin and
  eponyms come from the reviewed `cspell-words.txt`; abbreviations and short forms allowed only as typed
  answers from `cspell-answer-words.txt`. `src/content/spelling.test.ts` lets answer synonyms be British or
  American and keeps display text British (no -ize, center, gray…) with typographic apostrophes. Never add
  a word to a list just to pass: check it, or list it in `CONTENT-REVIEW.md`.

**Adding a module** (e.g. Heart): add `content/heart.json` (+ optional `heart.placeholder.json`), put
`heart.glb` in `public/models`, and set the module to `"available"` in `catalog.json` with its
`contentFile` and `model`. No code changes.

**Tuning cameras**: in dev, the 3D tab has a "Copy camera" button that copies the current view as JSON
for a structure's `camera` field.

## 3D models

`public/models/skeleton.glb` is the real **BodyParts3D 4.0** skeleton (© DBCLS): 276 named meshes,
~308k triangles, 1.4 MB with Draco compression. Each bone is its own mesh (`frontal`, `parietal.l`,
`rib_3.r`, `scaphoid.l`, `hand_phalanx_23.r`, …), with the original BodyParts3D name and id kept in
each node's `extras`.

Changes from the source data, all made by `scripts/import-bodyparts3d.mjs`:

- Bones only, plus teeth, costal cartilages and intervertebral discs so the skeleton looks complete.
- The **medial and lateral epicondyles** are split off each humerus as their own meshes, so they can
  be highlighted. The split is a sphere around the most medial or lateral point of the distal humerus.
- **The coccyx is approximate.** BodyParts3D has no coccyx mesh, so the script adds a smooth, tapered
  shape at the sacrum's apex. Replace it with a Z-Anatomy coccyx when you can.

### Whole-body layers

The body viewer's layers are built from whole BodyParts3D systems (`scripts/layers/<layer>.json`, using `systems` and
`exclude` instead of name patterns) and reuse the organ modules' own models:

```bash
for l in skin muscles arteries veins nervous glands; do
  node scripts/import-module.mjs /tmp/bp3d/package/model scripts/layers/$l.json /tmp/body-$l-raw.glb
done
SIMPLIFY_RATIO=0.5 SIMPLIFY_ERROR=0.002 scripts/convert-model.sh /tmp/body-skin-raw.glb body-skin
SIMPLIFY_RATIO=0.3 SIMPLIFY_ERROR=0.01 scripts/convert-model.sh /tmp/body-muscles-raw.glb body-muscles
SIMPLIFY_RATIO=0.4 SIMPLIFY_ERROR=0.006 scripts/convert-model.sh /tmp/body-arteries-raw.glb body-arteries
SIMPLIFY_RATIO=0.4 SIMPLIFY_ERROR=0.006 scripts/convert-model.sh /tmp/body-veins-raw.glb body-veins
SIMPLIFY_RATIO=0.4 SIMPLIFY_ERROR=0.008 scripts/convert-model.sh /tmp/body-nervous-raw.glb body-nervous
SIMPLIFY_RATIO=0.4 SIMPLIFY_ERROR=0.006 scripts/convert-model.sh /tmp/body-glands-raw.glb body-glands
```

The veins exclude BodyParts3D's "hepatovenous segment" volumes (liver segments, not vessels). The layers come to about
5 MB in all and are cached the first time each is opened.

### Building the other system models

Each system has a spec (`scripts/modules/<module>.json`: BodyParts3D name patterns) and a content source
(`scripts/content-src/<module>.py`):

```bash
python3 scripts/content-src/build.py muscles
node scripts/import-module.mjs /tmp/bp3d/package/model scripts/modules/muscles.json /tmp/muscles-raw.glb --fit-cameras content/muscles.json
SIMPLIFY_RATIO=0.35 SIMPLIFY_ERROR=0.003 scripts/convert-model.sh /tmp/muscles-raw.glb muscles
```

The digestive module also takes `--extra flat.glb` (open-anatomy-3d's model after `gltf-transform dequantize`
and `flatten`) for the liver surface. `skeleton-context.glb` is the skeleton simplified to ~95k triangles
(`SIMPLIFY_RATIO=0.18 SIMPLIFY_ERROR=0.01`), used as the faint backdrop.

### Rebuilding the skeleton model

The source is the [`@dagno/anatomy-model`](https://www.npmjs.com/package/@dagno/anatomy-model)
npm package (BodyParts3D 4.0, CC BY 4.0), used as data only:

```bash
mkdir -p /tmp/bp3d && (cd /tmp/bp3d && npm pack --ignore-scripts @dagno/anatomy-model && tar xzf *.tgz)
node scripts/import-bodyparts3d.mjs /tmp/bp3d/package/model /tmp/skeleton-raw.glb --fit-cameras content/skeleton.json
scripts/convert-model.sh /tmp/skeleton-raw.glb skeleton
npm test   # checks every meshName exists in the new GLB
```

`--fit-cameras` re-frames every question's camera around the real bone, keeping its viewing angle.

### Converting Z-Anatomy files to compressed GLB

```bash
scripts/convert-model.sh path/to/Z-Anatomy.blend skeleton   # or .fbx / .glb
```

The script:

1. Opens the file in Blender (headless) and exports only visible **meshes** to GLB, so Z-Anatomy's
   text labels, cameras and lights are left out. Object names are kept, and they become mesh names.
2. Runs [gltf-transform](https://gltf-transform.dev) (MIT): `dedup` → `weld` → `simplify` (50%) →
   `draco`. Node names are preserved.
3. Prints the mesh names so you can copy them into `meshName` fields.

After swapping in a different model:

- If it isn't in atlas space, set `model.scale` / `position` / `rotation` (degrees) in
  `catalog.json`.
- Update `meshName` fields to the new mesh names, run `npm test`, and re-tune cameras with
  "Copy camera".

### Placeholders

A module with no GLB yet can list a `placeholderFile` in `catalog.json`: primitive shapes (spheres,
boxes, capsules…) named like real meshes, so the quiz works before models exist. The skeleton no
longer needs one.

### Rendering

Anatomy uses a near-opaque ivory material under warm, neutral light and a procedural studio
environment (three's `RoomEnvironment`, nothing downloaded). The target structure is burgundy-red with a
soft rim glow. In Explore, a tapped structure gets a label pinned to the tapped point with a leader line,
placed outward from the body as on an atlas plate. Any part of it hidden behind other structures shows through as a faint red silhouette
(a `GreaterDepth` pass), so internal bones like the sphenoid and ethmoid stay findable.

The Draco decoder is served from `/draco` (copied from three.js), not from a CDN, so it works offline.

## Architecture

```
src/
  content/   types, lazy loader (one chunk per module), useModule hook, content tests
  lib/       pure logic: typing engine, spaced repetition, mesh matching, storage, sound
  state/     Zustand: settings + progress (persisted via storage interface), nav, quiz session
  viewer/    AnatomyViewer (lazy chunk with three.js), ModelInstance, Highlighter, CameraRig, placeholder builder
  quiz/      QuizScreen, AnswerWord, Keyboard, SessionSummary
  screens/   one per tab, Explore, Flashcards, Mock exam, Body, Search, Change course, Onboarding and Credits
  components/ masthead, tab bar, ScreenBar (the top bar of every full-screen view), icons
```

- **Storage**: everything persisted goes through `appStorage` in `src/lib/storage.ts`
  (`getItem` / `setItem` / `removeItem`, sync or async). Swap in a backend implementation there.
- **Performance**: three.js and R3F (~270 KB gzipped) load only when a 3D view opens; first load is
  ~139 KB gzipped JS (the app, every UI language and the catalogue) and ~8 KB CSS. Pixel ratio capped at 2; the canvas renders on demand, not every frame. The ghost
  carousel is a second canvas at half resolution that renders only when the question changes.
- **Highlight**: every mesh gets a shared translucent bone material; matched meshes get a red
  emissive material plus a Fresnel "glow shell" (small custom shader).

## Status

Verified in headless Chromium at 390×844: build, lint, tests, the full practice → summary → review
flow, hard mode, timed test, explore tap-to-identify, light mode, localStorage persistence, offline
reload, and every structure highlighted and framed correctly on the real BodyParts3D skeleton.

**UNVERIFIED**: real iPhone/Android devices (touch feel, Safari quirks, home-screen install, and
frame rate with the ~308k-triangle skeleton; if a phone struggles, lower the `--ratio` in
`convert-model.sh`), the Blender step of `convert-model.sh` (Blender wasn't available), and Z-Anatomy models.
