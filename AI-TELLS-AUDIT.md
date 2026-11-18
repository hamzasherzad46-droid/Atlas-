# AI-tells audit

Every place in Atlas that reads, looks, sounds or behaves as if it was generated, with where it is and
the fix. Step 1 of the studio-polish pass: nothing here is fixed yet. Each item gets ticked (or
explained) when it is done.

How it was checked: every English UI string (`src/i18n/en.ts`, all 446), every screen and component,
the three stylesheets, `src/lib/sound.ts`, the icons and PWA assets, and screenshots of onboarding,
Today, All content, a module page, the quiz, results, flashcards, the mock exam and Settings at
390 × 844 in dark and light (`.screens/before/`, made by `scripts/screens.cjs`). The anatomy content
(`content/*.json`) was scanned for the same tells but is not changed (rule: no content changes): it is
clean apart from one em dash (`content/heart.json:381`).

Line numbers refer to commit `dfd332e`.

## 1. Copy

| # | Where | Now | Problem | Fix |
|---|---|---|---|---|
| C1 | `src/i18n/en.ts:15`, `src/screens/ModuleRow.tsx` | "In preparation" | A "coming soon" dead end | Remove; hide anything not ready (no module is unavailable today, so nothing visible changes) |
| C2 | `en.ts:34` | "Male reproductive organs and glands (female anatomy in preparation)." | Dead-end promise | "Male reproductive organs and glands. The model is male." |
| C3 | `en.ts:27–33` | "…that frame and protect the body", "…move, hold and stabilise you", "…with the glands that feed it" | Decorative blurbs | Plain: "Bones and bony landmarks.", "Muscles of the head, trunk and limbs.", "Mouth to rectum, with the liver, pancreas and spleen." (one line each, all eight) |
| C4 | `en.ts:102–106`, `src/screens/TodayScreen.tsx:43, 65` | "Good morning." set at 40 px as the page headline | Filler greeting, and a second focal point on Today | Keep the greeting (it is the only use of Name) but as one small line under the date; the Continue card becomes the focal point |
| C5 | `en.ts:107` | "Start a streak today" | Nudge | "No streak yet" |
| C6 | `en.ts:119` | "Nothing weak yet. Your trouble spots will collect here as you practise." | Cute | "No weak spots yet. Structures you get wrong appear here." |
| C7 | `en.ts:130, 134, 140`; `TodayScreen.tsx:86`; `ModuleRow.tsx` | "Master {n} new structures", "{n}% mastered" | "Master" is on the banned list | "Learn {n} new structures", "{n}% learned" (same measure: structures in the long-interval box) |
| C8 | `en.ts:139` | "The body in 3D, every module, plate, mock exam and topic, in one place." | Tagline under a title that already says it | Remove the line |
| C9 | `en.ts:179` | "Rotate, zoom and tap any structure" | Three-item list | "Turn the model and tap a structure" |
| C10 | `en.ts:200` | "Type answers in English or Latin, the international terms." | Awkward | "Type the English or Latin name." |
| C11 | `en.ts:214` | "Couldn’t load this module." | Says nothing about what to do | "Couldn’t load the {module} model. Check your connection and try again." plus a Try again button |
| C12 | `en.ts:232, 234` | "Session complete" / "right on the first try" | Generic; fragment under the score | "Quiz finished" / "You got {a} of {b} right first time." |
| C13 | `en.ts:280–283` | `onb.kicker` "An anatomy atlas you type through", `onb.title`, `onb.name` | Taglines, and unused | Delete the unused keys |
| C14 | `en.ts:282` | "See it in 3D, type what it is, learn why it’s there. A few minutes a day." | Three-part tagline | "Pick your course. You can change it at any time." |
| C15 | `en.ts:286` | "Start learning" | Marketing verb | "Start" |
| C16 | `en.ts:288` | "Drag to rotate · pinch to zoom · double-tap to reset" | Three-item list | "Drag to turn. Pinch to zoom." (double-tap still works) |
| C17 | `en.ts:300` | "…on the anatomy every student should know. Every answer is explained." | Marketing | "Multiple-choice questions. Each answer is explained." |
| C18 | `en.ts:304–305` | "The essentials: …", "For top marks: … what happens when things go wrong." | Themed and salesy | "Bones, muscles, organs, body systems and anatomical terms." / "Nerves, vertebral levels, surface landmarks and clinical anatomy." |
| C19 | `en.ts:316` | "See my results" | Chatty | "See results" |
| C20 | `en.ts:319–322` | "Excellent work. You know this well." … "Every expert started here." | Tiered praise | Remove; the result says "You got 18 of 20." and "2 to review" |
| C21 | `en.ts:297`; `src/App.tsx:37` (`StudyPlanWatcher`); `src/components/bits.tsx:37–50` | Pop-up banner "Completed" when a study-plan item is done | Praise pop-up, gamified | Remove the pop-up; Progress still ticks the item |
| C22 | `en.ts:373` | "Something went wrong. Please try again." | Vague | Specific per case; fallback "Couldn’t reach the sign-in service. Check your connection and try again." |
| C23 | `en.ts:378` | Long hint listing every searchable kind | List | "Search by name, Latin name, topic or plate. British and American spellings both work." |
| C24 | `en.ts:409–410` | "…and the brain, layer by layer", "every layer" | Flourish | "Seven layers, from skin to bone." and remove "every layer" |
| C25 | `en.ts:416–419` | "…peel the body from skin to bone…", "as in a CT or MRI scan" | Themed | "Turn layers on and off. Tap a part to name it." etc., one plain sentence each |
| C26 | `en.ts:177, 381, 404`, `TodayScreen.tsx:86` | "All · 0% mastered", "Foundation or Higher · 15 to 45 questions" | Middots everywhere | Middot only for true metadata (counts, times); "0% learned" |
| C27 | `index.html:10`, `vite.config.ts:25–27` | "Atlas — Anatomy Trainer", "Type-to-learn 3D anatomy trainer…" | Em dash and jargon in the install name | Name "Atlas"; description "Learn anatomy in 3D by typing the names of structures." |
| C28 | `src/viewer/AnatomyViewer.tsx:177` | "Couldn’t load the 3D model. The quiz still works." (hard-coded English) | Not translatable, no action | Move to `en.ts`, add Try again |
| C29 | `src/components/TabBar.tsx:6` | Comment says "burgundy rule" | Stale | Fix the comment |

## 2. Visual design

| # | Where | Now | Problem | Fix |
|---|---|---|---|---|
| V1 | `src/components/Masthead.tsx:18` | Armillary seal beside the wordmark on every tab | Decoration with no job | Remove; seal stays only on onboarding and the app icon |
| V2 | `TodayScreen.tsx:175–176`, `src/components/Celestial.tsx:21–100` | Orion star chart at the foot of Today | Decoration | Remove (component deleted) |
| V3 | `src/screens/ExploreScreen.tsx:138–141`, `app.css` `.bearing` | "AZ 015° · ALT +04°" over the model | Instrument cosplay; no use to a student | Remove |
| V4 | Today (`TodayScreen.tsx`) | Four things at headline size: greeting (40 px), course (28), module (28), brass button | No single focal point | Continue card is the focus (module title + one brass button); everything else is list rows |
| V5 | Module page (`src/screens/AtlasScreen.tsx` `ModuleScreen`) | Three tests as equal rows; no primary action | No focal action | One primary button "Start spelling quiz" under the settings; other tests as rows |
| V6 | Results (`src/quiz/SessionSummary.tsx`, `quiz.css:331`) | 88 px score, two 38 px figures, a meter, all competing | Equal weights | Score is the focus; accuracy and time as one small line; Done is the action |
| V7 | `global.css:176–260`, `app.css`, `quiz.css` | 21 font sizes (10–88 px) | No scale | Tokens 34 / 24 / 18 / 15 / 13 (plus one score size); every size mapped |
| V8 | `ScreenBar.tsx:32`, `Masthead.tsx:22`, `ExploreScreen.tsx:115`, `MockScreen.tsx:179`, `Plates.tsx:211`, `BodyScreen.tsx:109`, `Curriculum.tsx:33, 48`, `SearchScreen.tsx:96`, `AccountScreen.tsx:173` | DM Mono on words ("Spelling quiz · 1 / 4", course name, "Labels", email) | Mono should be numbers only | Libre Franklin for words; DM Mono only for counts, times, plate numbers |
| V9 | Stylesheets | 8 radii (0, 1, 2, 4, 10, 11, 22 px, 50%) | Arbitrary | Two tokens: 2 px for controls and cards, round only for numbered marks |
| V10 | Stylesheets | Spacing such as 13, 14, 18, 22 px | Off grid | 4/8 px spacing tokens |
| V11 | `app.css` (0 `:active` rules) | Options, course choices, chips, tabs, plate keys and rows in lists have no pressed state | Taps feel dead | One pressed style for every tappable thing |
| V12 | `src/components/Icons.tsx:18`, used in every row | "→" arrow at the end of rows | Web-page arrow | Chevron "›" in the same line style |
| V13 | `Icons.tsx:18–48`; `ExploreScreen.tsx:117` (●/○), `Curriculum.tsx:48` (+/−), keyboard ⌫ ↵ glyphs | Five generic geometric icons plus Unicode symbols | No icon style | One set drawn as fine engraved line (same stroke, round ends, small hatching where it helps) |
| V14 | Only the Plates screen | The ten real 19th-century engravings are unused elsewhere | No real imagery | Cropped engravings as module covers, section headers and empty-state art (compressed WebP, lazy) |
| V15 | `app.css:739–836` (plate tags), `src/quiz/Keyboard.tsx:60` (`#fff`), `src/viewer/parts.tsx:23` (light `#e9eef5`, faintly blue), `src/viewer/highlight.ts` | Hard-coded colours; one blue-tinted light | Against the token rule and the no-blue rule | Tokens for all of them; warm the light |
| V16 | Every surface | Flat fills | Feels digital-default | Very subtle paper grain (a tiny tiled texture, both themes, under 2 KB) |
| V17 | `TodayScreen.tsx:115–122`; module page "Fix mistakes" | Dimmed rows reading "0" | Looks broken | Hide when there is nothing, or one quiet line "No mistakes to fix" |
| V18 | `app.css:522–555` | Full-width brass toast | Loud | Removed with C21 |
| V19 | Page titles (`.display` 40 px) under a masthead | Every tab opens with a giant title | Weight in the wrong place | Titles at 34 px; Today has no big title (the Continue card leads) |
| V20 | Section labels in the margin on every block | Same italic label weight for every section | Everything equal | Keep margin labels for real sections only; drop where a block speaks for itself |

## 3. Sound (`src/lib/sound.ts`)

| # | Where | Now | Fix |
|---|---|---|---|
| S1 | `sound.ts:3–7, 13–56` | Everything synthesised from sine/triangle oscillators | Real recordings, played through one small player with ±3 % pitch and volume per play, quiet |
| S2 | `sound.ts:65–67` (`key`) | Triangle + square blip | Quiet typewriter key, 4 variations picked at random |
| S3 | `sound.ts:68–72` (`wrong`) and `88–91` (`fail`) | Synthesised knock; two falling sines | Muted wooden tap |
| S4 | `sound.ts:73–80` (`complete`) | Sine bell rising a fifth with a "sparkle" | Single strike of a brass desk bell |
| S5 | `sound.ts:81–87` (`combo`), `99–100` (`level`) | Pentatonic arpeggios (unused) | Delete |
| S6 | `sound.ts:92–94` (`flip`) | 1.2 kHz blip | Page turn |
| S7 | `sound.ts:95–97` (`finish`) | Four-note pentatonic bell run at the end of a quiz | Silence (the summary is enough) |
| S8 | `sound.ts:101–112` (`mockFinish`) | Rising arpeggio into a major-chord fanfare | Rubber stamp on paper |
| S9 | — | No source files, no licences | `public/sounds/` (compressed, about 10–30 KB each) with `SOURCES.md` and the Credits screen listing source and licence for each |

## 4. Behaviour and motion

| # | Where | Now | Fix |
|---|---|---|---|
| B1 | `AnatomyViewer.tsx:86, 90, 213`; `QuizScreen.tsx:200`; `ExploreScreen.tsx:123`; `FlashcardScreen.tsx:125` (`Suspense fallback={null}`) | The 3D area stays blank for seconds while the model loads (seen in the quiz and flashcards) | Skeleton silhouette with a real percentage from the model download |
| B2 | `QuizScreen.tsx:107`, `FlashcardScreen.tsx:82`, `Plates.tsx:28, 78`, `Curriculum.tsx:25`, `SearchScreen.tsx:92`, `BodyScreen.tsx:94`, `TopicScreen.tsx:29` | Bare "Loading…" text | Skeleton rows in the shape of what is coming |
| B3 | `AnatomyViewer.tsx:177`, `en.ts:214, 373` | Errors with no action | What happened + what to do + Try again (C11, C22, C28) |
| B4 | See V11 | Missing pressed states | One pressed style everywhere |
| B5 | `global.css:92–94, 276, 610`; `app.css:540`; `quiz.css:382` | Durations 280–700 ms (meter fills over 700 ms, flashcard flip 520 ms, page and toast 320 ms) | 150–250 ms, ease-out, no bounce |
| B6 | `SessionSummary.tsx:12–25, 45` | The score counts up like a slot machine | Show the number; fade in |
| B7 | `src/quiz/AnswerWord.tsx`, `Keyboard.tsx:60` | Letters appear instantly; a wrong key flashes red with white text and shrinks | Letters settle (short fade and 2 px rise); correct word inks in verdigris; wrong = small horizontal shake |
| B8 | — | No haptics | Very short vibration for correct and wrong on Android, where supported, following the Sounds switch |
| B9 | `src/state/nav.ts` (not persisted) | A reload returns to Today: an open module, topic, plate or quiz is lost | Remember the current screen (and search query) and reopen it; an interrupted quiz reopens its start screen with Continue |
| B10 | `TodayScreen.tsx:104, 112, 120`; `SessionSummary.tsx`; `MockScreen.tsx` results; `ProgressScreen.tsx` | Numbers rendered raw, some in DM Mono with its slashed zero | Format with the locale (1,240) and tabular figures; DM Mono only where figures must align |
| B11 | `en.ts:119, 259, 379`; flashcards with none due | Plain-text empty states | Cropped engraving + one helpful line |
| B12 | `global.css:731–737` | Reduced motion handled for CSS | Keep; also stop the 3D camera tweens and the new letter motion |

## 5. Assets

| # | Where | Now | Fix |
|---|---|---|---|
| A1 | `public/icons/icon.svg` | Thin armillary sphere (7 px strokes on 512): at 29 px the lines vanish into a smudge | Redraw for small sizes: a bold engraved seal, legible at 29 px |
| A2 | `public/icons/*.png` | Rendered from A1 | Regenerate 192, 512, maskable and Apple touch icons from the new drawing |
| A3 | `index.html` | No iOS splash screens | Obsidian launch screens with the seal and wordmark for common iPhone sizes |
| A4 | `index.html` | No share image (no `og:image` or `twitter:card`) | 1200 × 630 share image: an engraving crop, the wordmark and one plain line |
| A5 | `index.html:12` | SVG favicon only | Add 32 px PNG for browsers that ignore SVG favicons |
| A6 | `vite.config.ts:25–27` | Install name with an em dash | See C27 |

## Kept on purpose

- The ten engraved plates (genuinely 19th-century, public domain) and the original tooth diagram.
- Dark-first palette, aged ivory, brass, Caslon and Franklin, hairline rules, notes hung in the margin.
- The course picker, the shared top bar, British spelling, the contrast and spelling tests, reduced-motion support.
- No gradients or glows, apart from the quiz's model area, which fades at its lower edge so the
  model does not end in a hard cut (`quiz.css:94–95`): functional, kept.
- Study notes and anatomy content: plain already, and not changed.

## Decisions for you

1. **Sound files.** I can't download recordings from here: Wikimedia Commons and Freesound are blocked
   on this machine, and Freesound needs a login to download anyway. Either
   (a) I ask for this machine to reach Wikimedia Commons (you approve a prompt) and pick public-domain
   or CC0 recordings there, which you then listen to before I commit; or
   (b) you send the five files (typewriter key ×4, wooden tap, brass desk bell, page turn, rubber
   stamp). Either way I wire the player first, so the files only have to be dropped into
   `public/sounds/` with their sources in `SOURCES.md`.
2. **"Mastered" becomes "learned"** everywhere in the interface (C7). The measure stays the same.
3. **The greeting stays, but small** (C4), because it is the only place the Name setting shows. If
   you'd rather lose both the greeting and the Name setting, say so (that would remove a feature).
4. **No more pop-up when a study-plan item is done** (C21). The item is still ticked in Progress.
5. **An interrupted quiz** reopens its start screen with Continue after a reload, rather than
   resuming mid-question (B9). Resuming mid-question is possible but a bigger change.
