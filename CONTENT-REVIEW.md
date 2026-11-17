# Content review

What a person with the right expertise should check, and what was changed, from the Part 3 review
(spelling and content checks). Nothing here was changed silently: every change made is listed in
section 1, and everything uncertain is listed with the file, the current text, a suggestion and the
reason, for a clinician or anatomist to decide.

How it was checked: names and Latin names against Terminologia Anatomica (TA98 and TA2) **from
knowledge** — the online TA2 viewer (ta2viewer.openanatomy.org) and FIPAT site could not be reached
from the build machine, so every TA2 point below should be confirmed against TA2 itself. All 111 mock
questions were read in full. Spelling is now enforced by `npm test` (see section 6).

## 1. Changes made

### Answer synonyms removed (21)

A synonym is an accepted typed answer, so it must name exactly the highlighted structure. Removed when
it names a larger, smaller or different structure, is ambiguous between structures, or is misspelled:

| File | Structure | Removed | Why |
|---|---|---|---|
| `content/skeleton.json` | occipital bone | “occiput” | The occiput is the back of the head (a region), not the bone. |
| `content/skeleton.json` | mandible | “jaw” | “Jaw” can mean either jaw (maxillae or mandible); “lower jaw” and “jawbone” stay. |
| `content/skeleton.json` | scapula | “shoulderblade” | Misspelling: the word is “shoulder blade”, which stays. |
| `content/skeleton.json` | hip bone | “pelvis” | The pelvis is both hip bones with the sacrum and coccyx, not one hip bone. |
| `content/skeleton.json` | inferior nasal concha | “turbinate” | Ambiguous: there are superior, middle and inferior turbinates; “inferior turbinate” stays. |
| `content/muscles.json` | pectoralis major | “pectoral” | Ambiguous: pectoralis major and minor are both pectoral muscles; “pec major” stays. |
| `content/muscles.json` | serratus anterior | “serratus” | Ambiguous: serratus posterior superior and inferior are separate muscles. |
| `content/muscles.json` | rhomboids | “rhomboid major” | Only one of the two rhomboids; the structure is both. |
| `content/muscles.json` | rhomboids | “rhomboid minor” | Only one of the two rhomboids; the structure is both. |
| `content/muscles.json` | erector spinae | “paraspinal muscles” | The paraspinal muscles also include the transversospinalis group (multifidus, rotatores). |
| `content/muscles.json` | vastus medialis | “vmo” | VMO (vastus medialis obliquus) is only the distal oblique fibres of vastus medialis. |
| `content/muscles.json` | gastrocnemius | “calf muscle” | The calf muscles are gastrocnemius and soleus (triceps surae). |
| `content/vessels.json` | common carotid artery | “carotid” | Ambiguous: the internal carotid is a separate structure in the same module. |
| `content/vessels.json` | common carotid artery | “carotid artery” | Ambiguous: common, internal or external carotid artery. |
| `content/airways.json` | thyroid cartilage | “adams apple” | The Adam’s apple is the laryngeal prominence, one part of the thyroid cartilage. |
| `content/airways.json` | bronchial tree | “airway tree” | The airway tree usually includes the trachea; the bronchial tree starts at the main bronchi. |
| `content/brain.json` | precentral gyrus | “motor cortex” | The motor cortex also includes the premotor and supplementary motor areas in front of the gyrus; “primary motor cortex” stays. |
| `content/brain.json` | postcentral gyrus | “somatosensory cortex” | The somatosensory cortex also includes secondary areas outside the gyrus; “primary somatosensory cortex” stays. |
| `content/brain.json` | cerebellum | “little brain” | A translation of the Latin, not a name used for the structure. |
| `content/digestive.json` | salivary glands | “submandibular gland” | One of the glands in the structure, not the structure (it is the submandibular and sublingual glands). |
| `content/digestive.json` | salivary glands | “sublingual gland” | One of the glands in the structure, not the structure (it is the submandibular and sublingual glands). |

### Typography

- Straight apostrophes and quotation marks in display text were made typographic, so a name always
  reads the same (for example *Broca’s area* was written two ways): `content/mock.json` (Erb’s,
  Klumpke’s, Pringle’s, McBurney’s, Bell’s, Broca’s, Wernicke’s, Horner’s and the quoted mnemonics and
  terms), `content/skeleton.json` (possessives such as boxer’s, golfer’s, jumper’s; “funny bone”, “little
  league elbow”), `content/courses.json` (developer note) and `src/i18n/en.ts` (“Today’s goal”). No
  wording changed.

### Study-aid notice

Shown on onboarding, Settings and Credits: “Atlas is a study aid for education only. It is not clinical
guidance. Always follow your course materials and local clinical policy.”

## 2. Synonyms questioned but kept

Kept because they are genuine alternative names for the same structure; listed because they are loose
or could be read two ways. A clinician may prefer to remove some.

| File | Structure | Synonym | Question |
|---|---|---|---|
| `content/skeleton.json` | cervical / thoracic / lumbar vertebrae | “cervical spine”, “thoracic spine”, “lumbar spine” | Strictly the region of the spine (with discs and joints); in practice the usual clinical name for the vertebrae. |
| `content/skeleton.json` | radius, ulna | “radial bone”, “ulnar bone” | Descriptive rather than standard terms; unambiguous. |
| `content/skeleton.json` | tarsals | “ankle bones” | Dictionary sense of the tarsus, though the navicular, cuboid and cuneiforms are in the midfoot. |
| `content/skeleton.json` | atlas, vertebra prominens | “c one”, “c seven” | Answers are typed in letters only (the on-screen keyboard has no digits, and typed digits are ignored), so these spelled-out forms are how C1 and C7 can be given. Unusual, but intended. |
| `content/muscles.json` | pectoralis major | “pecs” | Gym word; strictly both pectoral muscles. |
| `content/muscles.json` | biceps brachii, triceps brachii | “biceps”, “triceps” | Conventional; biceps femoris and triceps surae also exist. |
| `content/heart.json` | pulmonary trunk | “pulmonary artery” | Clinically the “main pulmonary artery”; the right and left pulmonary arteries are its branches. |
| `content/heart.json` | descending aorta | “thoracic aorta” | In TA the thoracic aorta is the thoracic part of the descending aorta; clinicians often include the ascending aorta and arch. |
| `content/heart.json` | posterior descending artery | “pda” | Also the usual abbreviation for patent ductus arteriosus. |
| `content/vessels.json` | inferior mesenteric artery | “ima” | Also used for the internal mammary (internal thoracic) artery. |
| `content/brain.json` | medulla oblongata | “medulla” | Also the renal and adrenal medulla (not structures in Atlas yet). |
| `content/brain.json` | precentral / postcentral gyrus | “primary motor cortex”, “primary somatosensory cortex” | Functional areas that occupy most of each gyrus, not the gyrus itself. |
| `content/digestive.json` | bile ducts | “bile duct”, “biliary tree” | “The bile duct” usually means the common bile duct; the biliary tree may include the gallbladder. |
| `content/reproductive.json` | vas deferens | “vas” | Clinical shorthand; “vas” alone means any vessel or duct. |

## 3. Names and Latin names (TA2)

All 245 structures (249 entries; four are taught in two modules) were checked. These differ from TA2
or need a decision:

| File | Structure | Current | Suggested | Why |
|---|---|---|---|---|
| `content/heart.json` | `descending-thoracic-aorta` | name “descending aorta”, Latin *aorta descendens* | name “descending thoracic aorta”, Latin *pars thoracica aortae* (*aorta thoracica*) | The id and the model piece are the thoracic part; *aorta descendens* also includes the abdominal aorta. Changing the name changes the expected answer, so not done without review. |
| `content/digestive.json` | `bile-ducts` | Latin *ductus biliferi* | Confirm in TA2 (possibly *ductus biliares*) | In TA98 *ductus biliferi* names the interlobular (intrahepatic) ducts, not the bile ducts as a whole. |
| `content/digestive.json` | `salivary-glands` | name “salivary glands”, Latin *glandulae salivariae* | Consider “submandibular and sublingual glands” | The model has no parotid gland, so the structure is two of the three major glands; the focus-module description says so, the name does not. |
| `content/muscles.json` | `rotator-cuff` | Latin field “rotator cuff” (English) | The TA2 Latin term, if TA2 has one | The Latin field repeats the English name (the app hides it, so nothing wrong is shown). |
| `content/muscles.json` | `hamstrings` | Latin *musculi ischiocrurales* | Confirm in TA2 | Widely used in Latin and German texts, but not a TA98 term. |
| `content/skeleton.json` | `phalanges`, `foot-phalanges` | Latin *phalanges manus*, *phalanges pedis* | *ossa digitorum manus / pedis* (*phalanges*) | TA98 lists the phalanges under *ossa digitorum*; the current forms are clear but not the TA headings. |
| `content/urinary.json` | `urethra` | Latin *urethra* | *urethra masculina* | The model is male (the focus module says so). |
| `content/vessels.json` | `dorsalis-pedis` | synonyms “dorsalis pedis”, “dorsal pedal artery” | add “dorsal artery of foot” | The TA2 English name is not accepted as an answer. |
| `content/vessels.json`, `content/urinary.json` | `renal-artery`, `renal-artery-u` | the same structure under two ids | keep (progress is saved by id) | Not an error; the consistency test allows exactly this pair and fails on any new one. |

Everything else matches TA98/TA2 Latin and spelling (British forms such as *oesophagus*, *coeliacus* are
the TA forms). English names that are clinical rather than TA2 English (left anterior descending artery,
posterior descending artery, circumflex artery, vas deferens, seminal vesicle, triquetral) have the TA2
English name as an accepted synonym.

Structures taught in two modules (diaphragm, external intercostals, superior and inferior vena cava) have
the same name, Latin name and synonyms in both (tested), but their definition, function and “why” are
worded differently in each module. The facts agree; a reviewer may want one wording.

## 4. Mock exams (111 questions)

Every question was read: the first option is correct and no other option is also correct. Two
explanations simplify, as exam teaching usually does:

| File | Question | Current | Suggested | Why |
|---|---|---|---|---|
| `content/mock.json` | h05 (supraspinatus) | “Supraspinatus starts abduction; the deltoid takes over after about the first 15 degrees.” | “Supraspinatus is most important for the first 15 degrees of abduction; the deltoid does most of the rest.” | Classic teaching; EMG studies show both muscles act from the start. |
| `content/mock.json` | h21 (tracheal bifurcation) | “T4–T5, at the level of the sternal angle” | keep, or note that it lies lower in the living, upright body (to be confirmed by a clinician) | The sternal-angle level is the textbook (cadaveric, supine) level. |

Also checked by test: 111 unique ids and question texts, four different options per question.

## 5. Notes for each course

Each structure has notes for some courses; a course shows its own note, or falls back to the next in its
list (`content/courses.json` `notes`). No new clinical notes were written in this part: they need a
clinician of each profession. Structures with the course's **own** note:

| Course | Own note | Skeleton | Muscles | Heart | Vessels | Airways | Brain | Digestive | Urinary | Reproductive |
|---|---|---|---|---|---|---|---|---|---|---|
| Nursing | 109 / 245 | 38/65 | 14/52 | 5/23 | 18/32 | 8/15 | 13/31 | 8/17 | 5/7 | 3/7 |
| Medicine | 181 / 245 | 51/65 | 27/52 | 23/23 | 19/32 | 10/15 | 30/31 | 15/17 | 4/7 | 6/7 |
| Physiotherapy | 51 / 245 | 23/65 | 22/52 | 0/23 | 1/32 | 3/15 | 2/31 | 0/17 | 1/7 | 0/7 |
| Sports science | 48 / 245 | 22/65 | 19/52 | 2/23 | 2/32 | 1/15 | 1/31 | 1/17 | 0/7 | 0/7 |
| Dentistry | 15 / 245 | 11/65 | 2/52 | 0/23 | 0/32 | 0/15 | 0/31 | 2/17 | 0/7 | 0/7 |

With fallbacks, 214 of 245 structures show a note to nursing and medicine students and 221–238 to the
others; the 31 structures with neither a nursing nor a medicine note show none to those two courses.
The note is always labelled with the course it was written for.

## 6. Spelling

- `npm test` runs `cspell` (British English, `cspell.config.json`) over `content/*.json`,
  `src/i18n/en.ts`, `README.md`, `NAVIGATION.md` and `CLAUDE.md` before the unit tests; any unknown word
  fails the build.
- `src/content/spelling.test.ts` checks what cspell can't: answer synonyms may be British **or**
  American (and nothing else); display text has no *-ize/-yze* forms or American forms the British
  dictionary lets through (center, gray, aging, artifact…); apostrophes and quotation marks are
  typographic.
- Word lists, each reviewed by hand and commented by group: `cspell-words.txt` (666 anatomy, Latin,
  eponym and source-title words), `cspell-answer-words.txt` (abbreviations and short forms allowed only
  as typed answers), `cspell-dev-words.txt` (software terms, developer documents only).
- Kept on purpose: “specialties” (the British medical form, as in specialty training); “little league
  elbow” (the name of the condition; British texts also say medial epicondyle apophysitis); “neuro
  check” in a nursing note (nurses’ usage; “neurological observations” is the formal term).

## 7. Needs a person

- **Clinician or anatomist:** the items in sections 2, 3 and 4, confirmed against TA2 itself; course notes
  for the gaps in section 5 (especially dentistry, physiotherapy and sports science).
- **Native speakers:** the six other interface languages — see `TRANSLATION-REVIEW.md`.
