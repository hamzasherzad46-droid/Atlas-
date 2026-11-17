# Navigation

<!-- cspell:ignore femr oesophagis esophagus -- deliberate misspellings and the American spelling, as search examples -->

How a student gets to everything in Atlas, and the proof that it works. Checked on a 390 × 844 phone
screen by `scripts/check-navigation.cjs` (output below).

## Rules

- **Today is the course home.** Its sections, in order: the course and *Change course*, *Continue where
  you left off* (or *Start here*), *Today's study*, *Learn*, *Test*, *For your course* (modules),
  *Topics for your course*, and *All content*. What the course lists comes from `content/courses.json`.
- **Every screen type is at most 2 taps from Today.** Typing in search is not counted as a tap.
- **One search**, from the magnifier in the masthead of every tab (Today, All content, Progress,
  Settings). It finds structures by name, other names and Latin names; modules; curriculum topics;
  plates; and mock-exam topics. British and American spellings find each other (*esophagus* finds
  *oesophagus*, *catheterization* finds *catheterisation*) and one or two slips are forgiven
  (*femr*, *oesophagis*). A result opens its page directly: a structure opens in 3D, selected and in view.
- **Back goes to the previous screen**, not to a fixed parent. The app keeps a history of screens and
  adds a browser history entry for each, so the in-app Back, the browser's back button and the phone's
  back gesture all do the same thing. Back from a search result returns to the same results.
- **The way out is always in the same place.** Every full-screen view (search, quiz, flashcards,
  Explore in 3D, the body in 3D, mock exam, results, credits, *Change course*, *Account*) has its button at the top
  left, 44 × 44 px: ← *Back* for a page, × *Close* for something in progress (a quiz, cards, a mock exam).
  Pages inside a tab (module, plate, topic) have ← *Back* at the top.
- **Nothing hidden behind a link.** The module page shows its test settings (questions from, difficulty,
  structures, time per answer) above the three tests they apply to; the old "Practice options" sheet is gone.
  *All content* shows every section on one page instead of four switches.

## One name per feature

| Feature | Name everywhere |
|---|---|
| Type the name of the highlighted structure | Spelling quiz |
| Pick the name from four | Multiple choice |
| Find the named structure on the model | Identify on the model |
| 20 questions against the clock | Timed exam |
| Foundation or Higher multiple-choice paper | Mock exam |
| Answer again the structures you got wrong | Fix mistakes |
| Rotate and tap a module's model | Explore in 3D |
| Every layer of the body in 3D | The body in 3D |
| What it does and why it is there | Flashcards |
| Curriculum topics and their study notes | Topics |
| Every module, plate, mock exam and topic | All content (tab and page) |
| Hint level in a quiz (Learn, Medium, Hard) | Difficulty |
| Foundation, intermediate or advanced structures | Structures |
| Seconds allowed for each answer | Time per answer |
| Keep progress on all your devices | Account (Settings): Sign in, Sign out, Delete account |

Changed English labels are listed in `src/i18n/changed-english.json`, and `TRANSLATION-REVIEW.md`
lists them for each of the other six languages for a native speaker to update.

## Click paths

From Today, with the Nursing course. "Back returns" means the in-app Back or Close returned to the
screen the student came from (Today, or the screen before for 2-tap paths).

| Screen | Taps from Today | Path | Arrives | Back returns |
|---|---|---|---|---|
| Search | 1 | “Search” | yes | yes |
| Change course | 1 | “Change course” | yes | yes |
| Continue / start (spelling quiz) | 1 | “Start spelling quiz” | yes | yes |
| Flashcards due | 1 | “Flashcards due” | yes | yes |
| Fix mistakes | 1 | “Fix mistakes” | yes | yes |
| Explore in 3D | 1 | “Explore in 3D” | yes | yes |
| Flashcards | 1 | “Flashcards” | yes | yes |
| The body in 3D | 1 | “The body in 3D” | yes | yes |
| Plate (course plate) | 1 | “The aorta and the venae cavae” | yes | yes |
| Spelling quiz | 1 | “Spelling quiz” | yes | yes |
| Multiple choice | 1 | “Multiple choice” | yes | yes |
| Identify on the model | 1 | “Identify on the model” | yes | yes |
| Timed exam | 1 | “Timed exam” | yes | yes |
| Mock exam (setup) | 1 | “Mock exam” | yes | yes |
| Mock exam (questions) | 2 | “Mock exam” → “Start the mock exam” | yes | yes |
| Course module page | 1 | “Pulse points” | yes | yes |
| Topic (course topic) | 1 | “Vascular Access Anatomy” | yes | yes |
| All content | 1 | “All content” | yes | n/a (tab) |
| Any module page | 2 | tab “All content” → “Kidneys and urinary tract” | yes | yes |
| Any plate | 2 | tab “All content” → “A molar tooth in section” | yes | yes |
| Progress | 1 | tab “Progress” | yes | n/a (tab) |
| Settings | 1 | tab “Settings” | yes | n/a (tab) |
| About and credits | 2 | tab “Settings” → “About and credits” | yes | yes |

When the build has accounts (Firebase configured), Settings starts with *Account*:

| Account screen | Taps from Today | Path |
|---|---|---|
| Sign in with email (or create an account) | 2 | tab “Settings” → “Sign in with email” |
| Continue with Google | 2 | tab “Settings” → “Continue with Google” (Google's window) |
| Delete account (signed in) | 2 | tab “Settings” → “Delete account” |
| Sign in on first run | 1 | onboarding → “Already have an account? Sign in” |

Specific items outside the student's course:

- any module or plate: *All content* → the row (2 taps);
- any curriculum topic: *All content* → its category → the topic (3 taps), or search (typing + 1 tap).
  Topics in the course's own categories are 2 taps from Today (category → topic); its featured topics, 1.

### Search

| Search for | Opens | Taps (plus typing) | Arrives | Back returns to results |
|---|---|---|---|---|
| “femur” | Explore, on the femur | 2 | yes | yes (browser back) |
| “esophagus” | Explore, on the oesophagus | 2 | yes | yes (browser back) |
| “catheterization” | Module page | 2 | yes | yes (browser back) |
| “cranial nerves” | Topic page | 2 | yes | yes (browser back) |
| “axilla” | Plate page | 2 | yes | yes (browser back) |
| “lymphatics” | Mock exam on one topic | 2 | yes | yes (browser back) |

## Accessibility checks

The same script audits every control on every screen above (scrolling through each), plus onboarding
and the search results: each must have a name for screen readers and a touch target of at least
44 × 44 px, measured by hit-testing so enlarged tap areas count and covered controls don't.

Documented exceptions:

- **Typing keyboard keys** are 44 px tall (48 px on wide screens) but 34–36 px wide on a 390 px
  screen (32–34 px at 375 px): ten letter keys must fit across one row, as on the phone's own keyboard.
- **Numbered marks on plates and on 3D models** are 22 px, 24 px apart on the image, so their tap
  areas (44 px, enlarged invisibly) overlap their neighbours. Each number also has a full-width 44 px row
  in the key underneath that does the same thing (WCAG 2.5.8 "equivalent" exception).

Also in this part:

- `index.html` no longer sets `maximum-scale=1`, so the page can be zoomed.
- Focus is shown by a 2 px brass outline (`:focus-visible`).
- `src/styles/contrast.test.ts` reads the colour tokens from `src/styles/global.css` and
  `src/quiz/quiz.css` and fails `npm test` if any text colour is below 4.5:1 on its background, in either
  theme or on the parchment flashcards (icons and focus rings: 3:1). To pass, four tokens were darkened
  or lightened slightly: faint ink in both themes, light-theme brass text, and the copper and green on
  the flashcards.

## Running the proof

```sh
npm run dev                              # in one terminal
node scripts/check-navigation.cjs        # needs Playwright installed (not a project dependency)
ONLY="Mock" node scripts/check-navigation.cjs   # just the paths whose name matches
# With accounts: run the Firebase emulators and the app in emulator mode (README "Accounts and sync"),
# then: node scripts/check-navigation.cjs http://localhost:5174/
```

Output of the last run, on a build with accounts (the emulators). The same run on a build without
accounts (as deployed until Firebase is configured) also ended "All checks passed."

```
| Screen | Taps from Today | Path | Arrives | Back returns |
|---|---|---|---|---|
| Search | 1 | “Search” | yes | yes |
| Change course | 1 | “Change course” | yes | yes |
| Continue / start (spelling quiz) | 1 | “Start spelling quiz” | yes | yes |
| Flashcards due | 1 | “Flashcards due” | yes | yes |
| Fix mistakes | 1 | “Fix mistakes” | yes | yes |
| Explore in 3D | 1 | “Explore in 3D” | yes | yes |
| Flashcards | 1 | “Flashcards” | yes | yes |
| The body in 3D | 1 | “The body in 3D” | yes | yes |
| Plate (course plate) | 1 | “The aorta and the venae cavae” | yes | yes |
| Spelling quiz | 1 | “Spelling quiz” | yes | yes |
| Multiple choice | 1 | “Multiple choice” | yes | yes |
| Identify on the model | 1 | “Identify on the model” | yes | yes |
| Timed exam | 1 | “Timed exam” | yes | yes |
| Mock exam (setup) | 1 | “Mock exam” | yes | yes |
| Mock exam (questions) | 2 | “Mock exam” → “Start the mock exam” | yes | yes |
| Course module page | 1 | “Pulse points” | yes | yes |
| Topic (course topic) | 1 | “Vascular Access Anatomy” | yes | yes |
| All content | 1 | “All content” | yes | n/a (tab) |
| Any module page | 2 | tab “All content” → “Kidneys and urinary tract” | yes | yes |
| Any plate | 2 | tab “All content” → “A molar tooth in section” | yes | yes |
| Progress | 1 | tab “Progress” | yes | n/a (tab) |
| Settings | 1 | tab “Settings” | yes | n/a (tab) |
| About and credits | 2 | tab “Settings” → “About and credits” | yes | yes |

| Search for | Opens | Taps (plus typing) | Arrives | Back returns to results |
|---|---|---|---|---|
| “femur” | Explore, on the femur | 2 | yes | yes (browser back) |
| “esophagus” | Explore, on the oesophagus | 2 | yes | yes (browser back) |
| “catheterization” | Module page | 2 | yes | yes (browser back) |
| “cranial nerves” | Topic page | 2 | yes | yes (browser back) |
| “axilla” | Plate page | 2 | yes | yes (browser back) |
| “lymphatics” | Mock exam on one topic | 2 | yes | yes (browser back) |

Back on the first press after a reload: yes

| Account screen | Taps from Today | Path | Arrives | Back returns |
|---|---|---|---|---|
| Sign in with email | 2 | tab “Settings” → “Sign in with email” | yes | yes |
| Delete account (signed in) | 2 | tab “Settings” → “Delete account” | yes | yes |

Controls without a name or smaller than 44 × 44 px:
none

All checks passed.
```
