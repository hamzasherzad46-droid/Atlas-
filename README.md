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
- **Sound**: a soft click as you type and a soft, airy tick for a right answer (short bursts of filtered noise,
  made in the app), and short real recordings, public domain (`public/sounds/SOURCES.md`): a soft knock on wood
  for a wrong answer, a page turning for flashcards.
  Quiet, and varied by up to 3 % in pitch and volume on every play; on Android, a very short vibration too.
  Settings can turn both off.
- **The body in 3D** (Today or Atlas): the whole BodyParts3D body in seven layers — skin, every muscle (442 meshes),
  bones, organs (heart, airways, digestive, urinary and reproductive organs, glands and eyes), arteries (639 meshes),
  veins (395 meshes) and the brain and nerves. Each layer loads only when switched on. Four views: Layers (peel from
  skin to bone), X-ray (skin and muscles see-through), Separate bones (pull the skeleton apart with a slider) and Cut
  (a transverse, coronal or sagittal section that moves with a slider). Tap any part to name it; parts that a module
  teaches show its notes and link to it; Isolate shows the part alone. BodyParts3D has no spinal or limb nerves, so
  the nerve layer shows the brain and the nerves of the eye.
- **Male or female body** (the Body setting: Settings, the body in 3D, the reproductive module, and a question on the
  welcome screen; synced with the account): the female body is the Human Reference Atlas female (Visible Human
  female, CC BY 4.0) — skin, the bony pelvis (ilium, ischium, pubis, sacrum, coccyx), the reproductive organs, the
  breasts and the bladder, with its own module (*Female reproductive organs*, 20 structures). It has no whole
  skeleton, muscles, vessels or nerves, so the female body view has three layers.
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
- **Design**: a medical HUD, a precision instrument for the human body. Black rooms (light mode: the same
  instrument on white) divided only by hairlines, white type in one typeface (Hanken Grotesk), one pale-blue accent
  for live data and selection. The 3D body is the hero: context drawn as fine edge lines or a point cloud, the
  structure asked about the one solid object, with a heading tape and AZ/EL readouts. The engraved plates stay as
  study material; there is no other imagery.
  The mark is the body's outline, traced from the skin model, inside a reticle. The app icons, the 32 px favicon,
  the iOS launch screens and the share image (`public/share.jpg`) are all drawn from the models by
  `node scripts/brand-assets.cjs`.

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

### The female body

`public/models/female-reproductive.glb` (the pelvis and organs, 35 meshes) and `female-skin.glb` come from the
**Human Reference Atlas** 3D Reference Object Library (HuBMAP, CC BY 4.0; sources, authors and DOIs in
`public/models/README.md`). `scripts/import-hra-female.py` (numpy only) takes the named structures from the
united female body, and the ilium, ischium and pubis from the female pelvis set (the united body has only the
ilium; both share one coordinate frame), keeps each source node name, label and ontology id in the mesh's extras,
and moves the body to stand at y = 0; `scripts/convert-model.sh` then simplifies and compresses it. No geometry
is drawn or borrowed from the male model. In the body view the one file is split into a bones layer and an
organs layer (`include` and `exclude` in `src/lib/bodyLayers.ts`).

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

The HUD style (`src/viewer/hud.ts`, `highlight.ts`): every structure is drawn as fine edge lines over a barely
visible surface (edges built a few milliseconds per frame and cached per geometry); the structure asked about is
the one solid, softly lit object with a faint rim, and turns briefly blue after a right answer. In X-ray the skin
and muscles become point clouds; on Today the body is a slowly turning point cloud. A heading tape and an AZ/EL
readout follow the camera; the views turn or sway slowly when left alone (never with reduced motion). Colours
come from the `--gl-*` tokens in `src/styles/global.css`. In Explore, a tapped structure gets a label pinned to
the tapped point with a leader line, placed outward from the body as on an atlas plate.

The Draco decoder is served from `/draco` (copied from three.js), not from a CDN, so it works offline.

## Accounts and sync

Signing in is optional. With an account (email and password, or Google), a student's progress
follows them to their other devices: structures learned, mistakes, flashcards, daily activity and
streaks, timed and mock exam results, and their course, daily goal and name (theme and sound stay per
device). Without one, everything stays on the device as before. Apple sign-in is not offered yet.

- **How it merges** (`src/lib/syncMerge.ts`, tested): per structure the most recent result wins; per
  flashcard the copy reviewed more often; exam results and finished study-plan items are all kept;
  daily activity is kept per device and added up; course, goal and name: the latest change wins.
  "Reset progress" erases the account's progress on every device.
- **When it syncs** (`src/account/sync.ts`): on sign-in and when the app comes to the front, four
  seconds after studying, when the app goes to the background, and when the connection returns. Each
  sync is one Firestore transaction on the student's own document, `users/{uid}`; nothing is written
  if nothing changed.
- **Sign out** syncs, then clears the device (progress stays in the account). **Delete account**
  (Settings) confirms with the password or Google, then erases the account and its document.
- **Size**: Firebase (Auth and Firestore Lite, ~62 KB gzipped) loads only when a student opens Account
  or is signed in. No Firebase Analytics.
- **Without configuration** (no `VITE_FIREBASE_*` variables) the build has no accounts at all.

### Setting it up (once)

1. In the [Firebase console](https://console.firebase.google.com), add a project (Google Analytics:
   off). The free Spark plan is enough; no billing is needed.
2. Project settings → General → Your apps → add a **Web** app. Note `apiKey`, `authDomain`,
   `projectId` and `appId` from its config. These are public by design (every Firebase web app ships
   them), but they are kept out of the code.
3. Authentication → Sign-in method: enable **Email/Password** and **Google**.
4. Authentication → Settings → Authorised domains: add `hamzasherzad46-droid.github.io`.
5. Firestore Database → Create database in production mode. Choose the location carefully (it cannot
   be changed later), for example `europe-west2` (London).
6. Firestore → Rules: replace them with the contents of `firestore.rules` and publish. (Or, with the
   Firebase CLI: `firebase deploy --only firestore:rules --project <project-id>`.)
7. GitHub → this repository → Settings → Secrets and variables → Actions → **Variables**: add
   `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID` and `FIREBASE_APP_ID`. The next
   deploy (any push to `main`, or re-run "Publish to GitHub Pages") includes accounts.
8. Recommended: in Google Cloud console → APIs & Services → Credentials, restrict the browser API key
   to the site `https://hamzasherzad46-droid.github.io/*` (and `http://localhost:5173/*` for development).

For local development against the real project, put the four values in `.env.local` as
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` and
`VITE_FIREBASE_APP_ID` (not committed).

### Testing with the Firebase emulators

Needs Java and the Firebase CLI (`npm install -g firebase-tools`); not project dependencies.

```bash
firebase emulators:start --project demo-atlas --only auth,firestore   # uses firestore.rules
VITE_FIREBASE_EMULATOR=true npx vite --port 5174                       # the app, signed in against the emulators
node scripts/check-sync.cjs                                            # two devices, end to end (Playwright)
```

`scripts/check-sync.cjs` signs up on one device, studies, signs in on a second, and checks that
progress, course and daily counts arrive and add up, offline changes sync later, sign-out clears the
device, another account can neither read nor write the data, unexpected fields are refused, Reset
erases the account's progress, and Delete account removes the account and its data. It also signs in
through Google's window (the emulator's stand-in) and deletes that account with Google's confirmation;
that part needs the browser to reach `apis.google.com` and reports "skipped" if it can't.

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
