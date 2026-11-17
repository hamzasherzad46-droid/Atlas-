# Translation review

For native speakers of the six other UI languages. English (`src/i18n/en.ts`) is the source. These languages are hidden in the app until reviewed (`OFFERED_LANGS` in `src/state/settings.ts`); once offered, any string still missing is shown in English.

This file is generated: run `npm run i18n:report` after changing UI strings. `npm test` fails if it is out of date, so nothing missing can go unnoticed. The anatomy content (structure names, notes, topics, plates and mock exams) is English by design and is not listed here.

## French (`fr`)

### Missing: shown in English (95)

| Key | English |
| --- | --- |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | Answered wrongly: {n} |
| `cards.end` | End flashcards |
| `mock.end` | Leave the mock exam |
| `account.title` | Account |
| `account.lede` | Sign in to keep your progress on all your devices. Atlas works the same without an account. |
| `account.google` | Continue with Google |
| `account.withEmail` | Sign in with email |
| `account.orEmail` | Or with email |
| `account.email` | Email |
| `account.password` | Password |
| `account.signInTitle` | Sign in |
| `account.createTitle` | Create an account |
| `account.signIn` | Sign in |
| `account.create` | Create account |
| `account.toCreate` | New here? Create an account |
| `account.toSignIn` | Already have an account? Sign in |
| `account.forgot` | Forgotten password? |
| `account.resetSent` | If there is an account for {email}, we’ve sent it a link to choose a new password. |
| `account.needEmail` | Enter your email address first. |
| `account.signedInAs` | Signed in as |
| `account.checking` | Checking your account… |
| `account.syncedAt` | Synced at {time} |
| `account.syncing` | Syncing… |
| `account.notSynced` | Not synced yet. |
| `account.offline` | Offline. Your progress will sync when you’re back online. |
| `account.syncError` | Couldn’t sync just now. Atlas will try again. |
| `account.signOut` | Sign out |
| `account.signOutNote` | Your progress stays in your account and is cleared from this device. |
| `account.signOutUnsynced` | Some progress hasn’t synced yet. Tap again to sign out anyway and lose it on this device. |
| `account.delete` | Delete account |
| `account.deleteTitle` | Delete your account |
| `account.deleteText` | This erases your account and all the progress saved in it, on every device, and clears this device. It can’t be undone. |
| `account.deletePassword` | Enter your password to confirm. |
| `account.deleteGoogle` | You’ll be asked to confirm with Google. |
| `account.deleteGo` | Delete my account |
| `account.deleted` | Your account has been deleted. |
| `account.privacy` | Your email address and your progress (with your course, daily goal and name) are stored in Google Firebase. You can delete your account in Settings at any time. |
| `account.resetEverywhere` | Also erases it in your account, on all your devices. |
| `account.err.email` | That doesn’t look like an email address. |
| `account.err.credentials` | Email or password not recognised. |
| `account.err.missingPassword` | Enter your password. |
| `account.err.inUse` | There is already an account with this email. Sign in instead. |
| `account.err.weak` | Choose a password of at least 6 characters. |
| `account.err.tooMany` | Too many attempts. Wait a few minutes and try again. |
| `account.err.offline` | You’re offline. Connect to the internet and try again. |
| `account.err.popup` | The sign-in window was blocked. Allow pop-ups for this site and try again. |
| `account.err.recent` | For your security, confirm it’s you and try again. |
| `account.err.setup` | Sign-in isn’t available right now. Please try again later. |
| `account.err.unknown` | Something went wrong. Please try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search structures by name, other name or Latin name, and modules, topics, plates and mock-exam topics. British and American spellings both work. |
| `search.none` | Nothing found for “{q}”. Check the spelling or try another name. |
| `search.count` | Results: {n} |
| `search.mockSub` | Mock exam · {n} questions |
| `search.kind.structure` | Structures |
| `search.kind.module` | Modules |
| `search.kind.topic` | Topics |
| `search.kind.plate` | Plates |
| `search.kind.mock` | Mock-exam topics |
| `course.your` | Your course |
| `course.change` | Change course |
| `course.kept` | Your progress is kept when you change course. |
| `today.continueTitle` | Continue where you left off |
| `today.study` | Today’s study |
| `today.forCourse` | For your course |
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Every module, region, plate and topic, for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `module.injection-sites` | Injection sites |
| `module.pulse-points` | Pulse points |
| `module.cannulation-veins` | Cannulation veins |
| `module.central-venous-access` | Central venous access |
| `module.urinary-catheterisation` | Urinary tract and catheterisation |
| `module.larynx` | Larynx |
| `module.mouth` | Tongue and salivary glands |
| `module.suprahyoid-muscles` | Suprahyoid muscles |
| `module.rotator-cuff-muscles` | Rotator cuff |
| `module.hip-muscles` | Muscles of the hip |
| `module.knee-muscles` | Muscles that cross the knee |
| `module.running-muscles` | Muscles of running |
| `module.sports-injury-muscles` | Often injured in sport |

### English changed since it was translated (21)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | Atlas |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | Reprendre l’entraînement |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | Erreurs à corriger |
| `atlas.title` | All content | “Atlas” became “All content”. | Atlas |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | Chaque système, chaque structure, en 3D. |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | Programme |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | Examen |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | Mode |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | Niveau |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | Chrono par réponse |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | Région |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | Commencer |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | Orthographe |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | Identifier |
| `summary.exam` | Timed exam complete | “Exam complete” became “Timed exam complete”. | Examen terminé |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | Les corriger maintenant |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | Examens |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | Aucun examen pour l’instant. |
| `you.track` | Course | “Study track” became “Course”. | Filière |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | Chrono par défaut |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | Pas de publicité, pas de pistage, pas de compte. Votre progression reste sur cet appareil. |

### Identical to English (9): check whether this is intended

| Key | Text |
| --- | --- |
| `region.valves` | Valves |
| `today.greeting` | {g}, {name}. |
| `today.greetingAlone` | {g}. |
| `group.thorax` | Thorax |
| `timer.sec` | {n} s |
| `mock.length` | Questions |
| `mock.right` | Correct |
| `mock.score` | Score |
| `layer.muscles` | Muscles |

## German (`de`)

### Missing: shown in English (95)

| Key | English |
| --- | --- |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | Answered wrongly: {n} |
| `cards.end` | End flashcards |
| `mock.end` | Leave the mock exam |
| `account.title` | Account |
| `account.lede` | Sign in to keep your progress on all your devices. Atlas works the same without an account. |
| `account.google` | Continue with Google |
| `account.withEmail` | Sign in with email |
| `account.orEmail` | Or with email |
| `account.email` | Email |
| `account.password` | Password |
| `account.signInTitle` | Sign in |
| `account.createTitle` | Create an account |
| `account.signIn` | Sign in |
| `account.create` | Create account |
| `account.toCreate` | New here? Create an account |
| `account.toSignIn` | Already have an account? Sign in |
| `account.forgot` | Forgotten password? |
| `account.resetSent` | If there is an account for {email}, we’ve sent it a link to choose a new password. |
| `account.needEmail` | Enter your email address first. |
| `account.signedInAs` | Signed in as |
| `account.checking` | Checking your account… |
| `account.syncedAt` | Synced at {time} |
| `account.syncing` | Syncing… |
| `account.notSynced` | Not synced yet. |
| `account.offline` | Offline. Your progress will sync when you’re back online. |
| `account.syncError` | Couldn’t sync just now. Atlas will try again. |
| `account.signOut` | Sign out |
| `account.signOutNote` | Your progress stays in your account and is cleared from this device. |
| `account.signOutUnsynced` | Some progress hasn’t synced yet. Tap again to sign out anyway and lose it on this device. |
| `account.delete` | Delete account |
| `account.deleteTitle` | Delete your account |
| `account.deleteText` | This erases your account and all the progress saved in it, on every device, and clears this device. It can’t be undone. |
| `account.deletePassword` | Enter your password to confirm. |
| `account.deleteGoogle` | You’ll be asked to confirm with Google. |
| `account.deleteGo` | Delete my account |
| `account.deleted` | Your account has been deleted. |
| `account.privacy` | Your email address and your progress (with your course, daily goal and name) are stored in Google Firebase. You can delete your account in Settings at any time. |
| `account.resetEverywhere` | Also erases it in your account, on all your devices. |
| `account.err.email` | That doesn’t look like an email address. |
| `account.err.credentials` | Email or password not recognised. |
| `account.err.missingPassword` | Enter your password. |
| `account.err.inUse` | There is already an account with this email. Sign in instead. |
| `account.err.weak` | Choose a password of at least 6 characters. |
| `account.err.tooMany` | Too many attempts. Wait a few minutes and try again. |
| `account.err.offline` | You’re offline. Connect to the internet and try again. |
| `account.err.popup` | The sign-in window was blocked. Allow pop-ups for this site and try again. |
| `account.err.recent` | For your security, confirm it’s you and try again. |
| `account.err.setup` | Sign-in isn’t available right now. Please try again later. |
| `account.err.unknown` | Something went wrong. Please try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search structures by name, other name or Latin name, and modules, topics, plates and mock-exam topics. British and American spellings both work. |
| `search.none` | Nothing found for “{q}”. Check the spelling or try another name. |
| `search.count` | Results: {n} |
| `search.mockSub` | Mock exam · {n} questions |
| `search.kind.structure` | Structures |
| `search.kind.module` | Modules |
| `search.kind.topic` | Topics |
| `search.kind.plate` | Plates |
| `search.kind.mock` | Mock-exam topics |
| `course.your` | Your course |
| `course.change` | Change course |
| `course.kept` | Your progress is kept when you change course. |
| `today.continueTitle` | Continue where you left off |
| `today.study` | Today’s study |
| `today.forCourse` | For your course |
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Every module, region, plate and topic, for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `module.injection-sites` | Injection sites |
| `module.pulse-points` | Pulse points |
| `module.cannulation-veins` | Cannulation veins |
| `module.central-venous-access` | Central venous access |
| `module.urinary-catheterisation` | Urinary tract and catheterisation |
| `module.larynx` | Larynx |
| `module.mouth` | Tongue and salivary glands |
| `module.suprahyoid-muscles` | Suprahyoid muscles |
| `module.rotator-cuff-muscles` | Rotator cuff |
| `module.hip-muscles` | Muscles of the hip |
| `module.knee-muscles` | Muscles that cross the knee |
| `module.running-muscles` | Muscles of running |
| `module.sports-injury-muscles` | Often injured in sport |

### English changed since it was translated (21)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | Atlas |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | Übung fortsetzen |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | Fehler zu korrigieren |
| `atlas.title` | All content | “Atlas” became “All content”. | Atlas |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | Jedes System, jede Struktur, in 3D. |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | Lehrplan |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | Prüfung |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | Modus |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | Niveau |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | Antwort-Timer |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | Region |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | Üben starten |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | Schreiben |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | Erkennen |
| `summary.exam` | Timed exam complete | “Exam complete” became “Timed exam complete”. | Prüfung beendet |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | Jetzt korrigieren |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | Prüfungen |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | Noch keine Prüfungen. |
| `you.track` | Course | “Study track” became “Course”. | Studienrichtung |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | Standard-Antwort-Timer |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | Keine Werbung, kein Tracking, kein Konto. Dein Fortschritt bleibt auf diesem Gerät. |

### Identical to English (7): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greeting` | {g}, {name}. |
| `today.greetingAlone` | {g}. |
| `group.thorax` | Thorax |
| `timer.sec` | {n} s |
| `you.name` | Name |
| `you.namePlaceholder` | Optional |
| `body.cut.sagittal` | Sagittal |

## Arabic (`ar`)

### Missing: shown in English (95)

| Key | English |
| --- | --- |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | Answered wrongly: {n} |
| `cards.end` | End flashcards |
| `mock.end` | Leave the mock exam |
| `account.title` | Account |
| `account.lede` | Sign in to keep your progress on all your devices. Atlas works the same without an account. |
| `account.google` | Continue with Google |
| `account.withEmail` | Sign in with email |
| `account.orEmail` | Or with email |
| `account.email` | Email |
| `account.password` | Password |
| `account.signInTitle` | Sign in |
| `account.createTitle` | Create an account |
| `account.signIn` | Sign in |
| `account.create` | Create account |
| `account.toCreate` | New here? Create an account |
| `account.toSignIn` | Already have an account? Sign in |
| `account.forgot` | Forgotten password? |
| `account.resetSent` | If there is an account for {email}, we’ve sent it a link to choose a new password. |
| `account.needEmail` | Enter your email address first. |
| `account.signedInAs` | Signed in as |
| `account.checking` | Checking your account… |
| `account.syncedAt` | Synced at {time} |
| `account.syncing` | Syncing… |
| `account.notSynced` | Not synced yet. |
| `account.offline` | Offline. Your progress will sync when you’re back online. |
| `account.syncError` | Couldn’t sync just now. Atlas will try again. |
| `account.signOut` | Sign out |
| `account.signOutNote` | Your progress stays in your account and is cleared from this device. |
| `account.signOutUnsynced` | Some progress hasn’t synced yet. Tap again to sign out anyway and lose it on this device. |
| `account.delete` | Delete account |
| `account.deleteTitle` | Delete your account |
| `account.deleteText` | This erases your account and all the progress saved in it, on every device, and clears this device. It can’t be undone. |
| `account.deletePassword` | Enter your password to confirm. |
| `account.deleteGoogle` | You’ll be asked to confirm with Google. |
| `account.deleteGo` | Delete my account |
| `account.deleted` | Your account has been deleted. |
| `account.privacy` | Your email address and your progress (with your course, daily goal and name) are stored in Google Firebase. You can delete your account in Settings at any time. |
| `account.resetEverywhere` | Also erases it in your account, on all your devices. |
| `account.err.email` | That doesn’t look like an email address. |
| `account.err.credentials` | Email or password not recognised. |
| `account.err.missingPassword` | Enter your password. |
| `account.err.inUse` | There is already an account with this email. Sign in instead. |
| `account.err.weak` | Choose a password of at least 6 characters. |
| `account.err.tooMany` | Too many attempts. Wait a few minutes and try again. |
| `account.err.offline` | You’re offline. Connect to the internet and try again. |
| `account.err.popup` | The sign-in window was blocked. Allow pop-ups for this site and try again. |
| `account.err.recent` | For your security, confirm it’s you and try again. |
| `account.err.setup` | Sign-in isn’t available right now. Please try again later. |
| `account.err.unknown` | Something went wrong. Please try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search structures by name, other name or Latin name, and modules, topics, plates and mock-exam topics. British and American spellings both work. |
| `search.none` | Nothing found for “{q}”. Check the spelling or try another name. |
| `search.count` | Results: {n} |
| `search.mockSub` | Mock exam · {n} questions |
| `search.kind.structure` | Structures |
| `search.kind.module` | Modules |
| `search.kind.topic` | Topics |
| `search.kind.plate` | Plates |
| `search.kind.mock` | Mock-exam topics |
| `course.your` | Your course |
| `course.change` | Change course |
| `course.kept` | Your progress is kept when you change course. |
| `today.continueTitle` | Continue where you left off |
| `today.study` | Today’s study |
| `today.forCourse` | For your course |
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Every module, region, plate and topic, for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `module.injection-sites` | Injection sites |
| `module.pulse-points` | Pulse points |
| `module.cannulation-veins` | Cannulation veins |
| `module.central-venous-access` | Central venous access |
| `module.urinary-catheterisation` | Urinary tract and catheterisation |
| `module.larynx` | Larynx |
| `module.mouth` | Tongue and salivary glands |
| `module.suprahyoid-muscles` | Suprahyoid muscles |
| `module.rotator-cuff-muscles` | Rotator cuff |
| `module.hip-muscles` | Muscles of the hip |
| `module.knee-muscles` | Muscles that cross the knee |
| `module.running-muscles` | Muscles of running |
| `module.sports-injury-muscles` | Often injured in sport |

### English changed since it was translated (21)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | الأطلس |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | متابعة التدريب |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | أخطاء لتصحيحها |
| `atlas.title` | All content | “Atlas” became “All content”. | الأطلس |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | كل جهاز وكل تركيب، ثلاثي الأبعاد. |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | المنهج |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | اختبار |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | الوضع |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | المستوى |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | مؤقّت الإجابة |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | المنطقة |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | ابدأ التدريب |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | التهجئة |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | التعرّف |
| `summary.exam` | Timed exam complete | “Exam complete” became “Timed exam complete”. | انتهى الاختبار |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | صحّحها الآن |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | الاختبارات |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | لا اختبارات بعد. |
| `you.track` | Course | “Study track” became “Course”. | مسار الدراسة |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | مؤقّت الإجابة الافتراضي |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | بلا إعلانات ولا تتبّع ولا حسابات. يبقى تقدّمك على هذا الجهاز فقط. |

### Identical to English (1): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greetingAlone` | {g}. |

## Russian (`ru`)

### Missing: shown in English (95)

| Key | English |
| --- | --- |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | Answered wrongly: {n} |
| `cards.end` | End flashcards |
| `mock.end` | Leave the mock exam |
| `account.title` | Account |
| `account.lede` | Sign in to keep your progress on all your devices. Atlas works the same without an account. |
| `account.google` | Continue with Google |
| `account.withEmail` | Sign in with email |
| `account.orEmail` | Or with email |
| `account.email` | Email |
| `account.password` | Password |
| `account.signInTitle` | Sign in |
| `account.createTitle` | Create an account |
| `account.signIn` | Sign in |
| `account.create` | Create account |
| `account.toCreate` | New here? Create an account |
| `account.toSignIn` | Already have an account? Sign in |
| `account.forgot` | Forgotten password? |
| `account.resetSent` | If there is an account for {email}, we’ve sent it a link to choose a new password. |
| `account.needEmail` | Enter your email address first. |
| `account.signedInAs` | Signed in as |
| `account.checking` | Checking your account… |
| `account.syncedAt` | Synced at {time} |
| `account.syncing` | Syncing… |
| `account.notSynced` | Not synced yet. |
| `account.offline` | Offline. Your progress will sync when you’re back online. |
| `account.syncError` | Couldn’t sync just now. Atlas will try again. |
| `account.signOut` | Sign out |
| `account.signOutNote` | Your progress stays in your account and is cleared from this device. |
| `account.signOutUnsynced` | Some progress hasn’t synced yet. Tap again to sign out anyway and lose it on this device. |
| `account.delete` | Delete account |
| `account.deleteTitle` | Delete your account |
| `account.deleteText` | This erases your account and all the progress saved in it, on every device, and clears this device. It can’t be undone. |
| `account.deletePassword` | Enter your password to confirm. |
| `account.deleteGoogle` | You’ll be asked to confirm with Google. |
| `account.deleteGo` | Delete my account |
| `account.deleted` | Your account has been deleted. |
| `account.privacy` | Your email address and your progress (with your course, daily goal and name) are stored in Google Firebase. You can delete your account in Settings at any time. |
| `account.resetEverywhere` | Also erases it in your account, on all your devices. |
| `account.err.email` | That doesn’t look like an email address. |
| `account.err.credentials` | Email or password not recognised. |
| `account.err.missingPassword` | Enter your password. |
| `account.err.inUse` | There is already an account with this email. Sign in instead. |
| `account.err.weak` | Choose a password of at least 6 characters. |
| `account.err.tooMany` | Too many attempts. Wait a few minutes and try again. |
| `account.err.offline` | You’re offline. Connect to the internet and try again. |
| `account.err.popup` | The sign-in window was blocked. Allow pop-ups for this site and try again. |
| `account.err.recent` | For your security, confirm it’s you and try again. |
| `account.err.setup` | Sign-in isn’t available right now. Please try again later. |
| `account.err.unknown` | Something went wrong. Please try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search structures by name, other name or Latin name, and modules, topics, plates and mock-exam topics. British and American spellings both work. |
| `search.none` | Nothing found for “{q}”. Check the spelling or try another name. |
| `search.count` | Results: {n} |
| `search.mockSub` | Mock exam · {n} questions |
| `search.kind.structure` | Structures |
| `search.kind.module` | Modules |
| `search.kind.topic` | Topics |
| `search.kind.plate` | Plates |
| `search.kind.mock` | Mock-exam topics |
| `course.your` | Your course |
| `course.change` | Change course |
| `course.kept` | Your progress is kept when you change course. |
| `today.continueTitle` | Continue where you left off |
| `today.study` | Today’s study |
| `today.forCourse` | For your course |
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Every module, region, plate and topic, for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `module.injection-sites` | Injection sites |
| `module.pulse-points` | Pulse points |
| `module.cannulation-veins` | Cannulation veins |
| `module.central-venous-access` | Central venous access |
| `module.urinary-catheterisation` | Urinary tract and catheterisation |
| `module.larynx` | Larynx |
| `module.mouth` | Tongue and salivary glands |
| `module.suprahyoid-muscles` | Suprahyoid muscles |
| `module.rotator-cuff-muscles` | Rotator cuff |
| `module.hip-muscles` | Muscles of the hip |
| `module.knee-muscles` | Muscles that cross the knee |
| `module.running-muscles` | Muscles of running |
| `module.sports-injury-muscles` | Often injured in sport |

### English changed since it was translated (21)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | Атлас |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | Продолжить практику |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | Ошибок исправить |
| `atlas.title` | All content | “Atlas” became “All content”. | Атлас |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | Каждая система, каждая структура — в 3D. |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | Программа |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | Экзамен |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | Режим |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | Уровень |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | Таймер ответа |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | Область |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | Начать практику |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | Написание |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | Найти на модели |
| `summary.exam` | Timed exam complete | “Exam complete” became “Timed exam complete”. | Экзамен завершён |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | Исправить сейчас |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | Экзамены |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | Экзаменов пока нет. |
| `you.track` | Course | “Study track” became “Course”. | Направление |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | Таймер по умолчанию |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | Без рекламы, слежки и аккаунтов. Ваш прогресс хранится только на этом устройстве. |

### Identical to English (2): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greeting` | {g}, {name}. |
| `today.greetingAlone` | {g}. |

## Chinese (`zh`)

### Missing: shown in English (95)

| Key | English |
| --- | --- |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | Answered wrongly: {n} |
| `cards.end` | End flashcards |
| `mock.end` | Leave the mock exam |
| `account.title` | Account |
| `account.lede` | Sign in to keep your progress on all your devices. Atlas works the same without an account. |
| `account.google` | Continue with Google |
| `account.withEmail` | Sign in with email |
| `account.orEmail` | Or with email |
| `account.email` | Email |
| `account.password` | Password |
| `account.signInTitle` | Sign in |
| `account.createTitle` | Create an account |
| `account.signIn` | Sign in |
| `account.create` | Create account |
| `account.toCreate` | New here? Create an account |
| `account.toSignIn` | Already have an account? Sign in |
| `account.forgot` | Forgotten password? |
| `account.resetSent` | If there is an account for {email}, we’ve sent it a link to choose a new password. |
| `account.needEmail` | Enter your email address first. |
| `account.signedInAs` | Signed in as |
| `account.checking` | Checking your account… |
| `account.syncedAt` | Synced at {time} |
| `account.syncing` | Syncing… |
| `account.notSynced` | Not synced yet. |
| `account.offline` | Offline. Your progress will sync when you’re back online. |
| `account.syncError` | Couldn’t sync just now. Atlas will try again. |
| `account.signOut` | Sign out |
| `account.signOutNote` | Your progress stays in your account and is cleared from this device. |
| `account.signOutUnsynced` | Some progress hasn’t synced yet. Tap again to sign out anyway and lose it on this device. |
| `account.delete` | Delete account |
| `account.deleteTitle` | Delete your account |
| `account.deleteText` | This erases your account and all the progress saved in it, on every device, and clears this device. It can’t be undone. |
| `account.deletePassword` | Enter your password to confirm. |
| `account.deleteGoogle` | You’ll be asked to confirm with Google. |
| `account.deleteGo` | Delete my account |
| `account.deleted` | Your account has been deleted. |
| `account.privacy` | Your email address and your progress (with your course, daily goal and name) are stored in Google Firebase. You can delete your account in Settings at any time. |
| `account.resetEverywhere` | Also erases it in your account, on all your devices. |
| `account.err.email` | That doesn’t look like an email address. |
| `account.err.credentials` | Email or password not recognised. |
| `account.err.missingPassword` | Enter your password. |
| `account.err.inUse` | There is already an account with this email. Sign in instead. |
| `account.err.weak` | Choose a password of at least 6 characters. |
| `account.err.tooMany` | Too many attempts. Wait a few minutes and try again. |
| `account.err.offline` | You’re offline. Connect to the internet and try again. |
| `account.err.popup` | The sign-in window was blocked. Allow pop-ups for this site and try again. |
| `account.err.recent` | For your security, confirm it’s you and try again. |
| `account.err.setup` | Sign-in isn’t available right now. Please try again later. |
| `account.err.unknown` | Something went wrong. Please try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search structures by name, other name or Latin name, and modules, topics, plates and mock-exam topics. British and American spellings both work. |
| `search.none` | Nothing found for “{q}”. Check the spelling or try another name. |
| `search.count` | Results: {n} |
| `search.mockSub` | Mock exam · {n} questions |
| `search.kind.structure` | Structures |
| `search.kind.module` | Modules |
| `search.kind.topic` | Topics |
| `search.kind.plate` | Plates |
| `search.kind.mock` | Mock-exam topics |
| `course.your` | Your course |
| `course.change` | Change course |
| `course.kept` | Your progress is kept when you change course. |
| `today.continueTitle` | Continue where you left off |
| `today.study` | Today’s study |
| `today.forCourse` | For your course |
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Every module, region, plate and topic, for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `module.injection-sites` | Injection sites |
| `module.pulse-points` | Pulse points |
| `module.cannulation-veins` | Cannulation veins |
| `module.central-venous-access` | Central venous access |
| `module.urinary-catheterisation` | Urinary tract and catheterisation |
| `module.larynx` | Larynx |
| `module.mouth` | Tongue and salivary glands |
| `module.suprahyoid-muscles` | Suprahyoid muscles |
| `module.rotator-cuff-muscles` | Rotator cuff |
| `module.hip-muscles` | Muscles of the hip |
| `module.knee-muscles` | Muscles that cross the knee |
| `module.running-muscles` | Muscles of running |
| `module.sports-injury-muscles` | Often injured in sport |

### English changed since it was translated (21)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | 图谱 |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | 继续练习 |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | 待纠正错误 |
| `atlas.title` | All content | “Atlas” became “All content”. | 图谱 |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | 每个系统、每个结构，均为 3D。 |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | 课程 |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | 测验 |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | 模式 |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | 难度 |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | 答题计时 |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | 区域 |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | 开始练习 |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | 拼写 |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | 识别 |
| `summary.exam` | Timed exam complete | “Exam complete” became “Timed exam complete”. | 测验完成 |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | 现在纠正 |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | 测验 |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | 暂无测验。 |
| `you.track` | Course | “Study track” became “Course”. | 学习方向 |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | 默认答题计时 |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | 没有广告、没有追踪、无需账号。你的进度只保存在本设备上。 |

### Identical to English (0): check whether this is intended

None.

## Korean (`ko`)

### Missing: shown in English (95)

| Key | English |
| --- | --- |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | Answered wrongly: {n} |
| `cards.end` | End flashcards |
| `mock.end` | Leave the mock exam |
| `account.title` | Account |
| `account.lede` | Sign in to keep your progress on all your devices. Atlas works the same without an account. |
| `account.google` | Continue with Google |
| `account.withEmail` | Sign in with email |
| `account.orEmail` | Or with email |
| `account.email` | Email |
| `account.password` | Password |
| `account.signInTitle` | Sign in |
| `account.createTitle` | Create an account |
| `account.signIn` | Sign in |
| `account.create` | Create account |
| `account.toCreate` | New here? Create an account |
| `account.toSignIn` | Already have an account? Sign in |
| `account.forgot` | Forgotten password? |
| `account.resetSent` | If there is an account for {email}, we’ve sent it a link to choose a new password. |
| `account.needEmail` | Enter your email address first. |
| `account.signedInAs` | Signed in as |
| `account.checking` | Checking your account… |
| `account.syncedAt` | Synced at {time} |
| `account.syncing` | Syncing… |
| `account.notSynced` | Not synced yet. |
| `account.offline` | Offline. Your progress will sync when you’re back online. |
| `account.syncError` | Couldn’t sync just now. Atlas will try again. |
| `account.signOut` | Sign out |
| `account.signOutNote` | Your progress stays in your account and is cleared from this device. |
| `account.signOutUnsynced` | Some progress hasn’t synced yet. Tap again to sign out anyway and lose it on this device. |
| `account.delete` | Delete account |
| `account.deleteTitle` | Delete your account |
| `account.deleteText` | This erases your account and all the progress saved in it, on every device, and clears this device. It can’t be undone. |
| `account.deletePassword` | Enter your password to confirm. |
| `account.deleteGoogle` | You’ll be asked to confirm with Google. |
| `account.deleteGo` | Delete my account |
| `account.deleted` | Your account has been deleted. |
| `account.privacy` | Your email address and your progress (with your course, daily goal and name) are stored in Google Firebase. You can delete your account in Settings at any time. |
| `account.resetEverywhere` | Also erases it in your account, on all your devices. |
| `account.err.email` | That doesn’t look like an email address. |
| `account.err.credentials` | Email or password not recognised. |
| `account.err.missingPassword` | Enter your password. |
| `account.err.inUse` | There is already an account with this email. Sign in instead. |
| `account.err.weak` | Choose a password of at least 6 characters. |
| `account.err.tooMany` | Too many attempts. Wait a few minutes and try again. |
| `account.err.offline` | You’re offline. Connect to the internet and try again. |
| `account.err.popup` | The sign-in window was blocked. Allow pop-ups for this site and try again. |
| `account.err.recent` | For your security, confirm it’s you and try again. |
| `account.err.setup` | Sign-in isn’t available right now. Please try again later. |
| `account.err.unknown` | Something went wrong. Please try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search structures by name, other name or Latin name, and modules, topics, plates and mock-exam topics. British and American spellings both work. |
| `search.none` | Nothing found for “{q}”. Check the spelling or try another name. |
| `search.count` | Results: {n} |
| `search.mockSub` | Mock exam · {n} questions |
| `search.kind.structure` | Structures |
| `search.kind.module` | Modules |
| `search.kind.topic` | Topics |
| `search.kind.plate` | Plates |
| `search.kind.mock` | Mock-exam topics |
| `course.your` | Your course |
| `course.change` | Change course |
| `course.kept` | Your progress is kept when you change course. |
| `today.continueTitle` | Continue where you left off |
| `today.study` | Today’s study |
| `today.forCourse` | For your course |
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Every module, region, plate and topic, for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `module.injection-sites` | Injection sites |
| `module.pulse-points` | Pulse points |
| `module.cannulation-veins` | Cannulation veins |
| `module.central-venous-access` | Central venous access |
| `module.urinary-catheterisation` | Urinary tract and catheterisation |
| `module.larynx` | Larynx |
| `module.mouth` | Tongue and salivary glands |
| `module.suprahyoid-muscles` | Suprahyoid muscles |
| `module.rotator-cuff-muscles` | Rotator cuff |
| `module.hip-muscles` | Muscles of the hip |
| `module.knee-muscles` | Muscles that cross the knee |
| `module.running-muscles` | Muscles of running |
| `module.sports-injury-muscles` | Often injured in sport |

### English changed since it was translated (21)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | 아틀라스 |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | 연습 이어서 하기 |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | 고칠 오답 |
| `atlas.title` | All content | “Atlas” became “All content”. | 아틀라스 |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | 모든 계통, 모든 구조를 3D로. |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | 교육과정 |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | 시험 |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | 모드 |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | 난이도 |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | 답변 타이머 |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | 부위 |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | 연습 시작 |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | 철자 |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | 찾기 |
| `summary.exam` | Timed exam complete | “Exam complete” became “Timed exam complete”. | 시험 완료 |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | 지금 고치기 |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | 시험 |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | 아직 본 시험이 없어요. |
| `you.track` | Course | “Study track” became “Course”. | 전공 |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | 기본 답변 타이머 |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | 광고, 추적, 계정이 없어요. 진도는 이 기기에만 저장돼요. |

### Identical to English (1): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greetingAlone` | {g}. |
