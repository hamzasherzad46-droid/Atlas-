# Translation review

For native speakers of the six other UI languages. English (`src/i18n/en.ts`) is the source. These languages are hidden in the app until reviewed (`OFFERED_LANGS` in `src/state/settings.ts`); once offered, any string still missing is shown in English.

This file is generated: run `npm run i18n:report` after changing UI strings. `npm test` fails if it is out of date, so nothing missing can go unnoticed. The anatomy content (structure names, notes, topics, plates and mock exams) is English by design and is not listed here.

## French (`fr`)

### Missing: shown in English (103)

| Key | English |
| --- | --- |
| `common.retry` | Try again |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | {n} to answer again |
| `summary.result` | You got {a} of {b} right first time. |
| `summary.resultExam` | You got {a} of {b} without a mistake. |
| `cards.end` | End flashcards |
| `viewer.error` | Couldn’t load the 3D model. Check your connection and try again. |
| `viewer.loading` | Loading the 3D model |
| `mock.end` | Leave the mock exam |
| `mock.result` | You got {a} of {b}. |
| `mock.toReview` | {n} to review below. |
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
| `account.err.setup` | Sign-in isn’t available right now. Try again later. |
| `account.err.unknown` | Couldn’t reach the sign-in service. Check your connection and try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search by name, Latin name, topic or plate. British and American spellings both work. |
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
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Modules, plates and topics for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `credits.sounds` | Sounds |
| `today.forCourse` | For your course |
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

### English changed since it was translated (54)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | Atlas |
| `systemBlurb.skeletal` | Bones and bony landmarks. | “Bones and landmarks that frame and protect the body.” became “Bones and bony landmarks.”. | Les os et repères qui soutiennent et protègent le corps. |
| `systemBlurb.muscular` | Muscles of the head, trunk and limbs. | “The muscles that move, hold and stabilise you.” became “Muscles of the head, trunk and limbs.”. | Les muscles qui vous meuvent, vous tiennent et vous stabilisent. |
| `systemBlurb.cardiovascular` | The heart and the major blood vessels. | “The heart and the vessels that carry blood.” became “The heart and the major blood vessels.”. | Le cœur et les vaisseaux qui transportent le sang. |
| `systemBlurb.respiratory` | Airways, lungs and the muscles of breathing. | “Airways, bronchi and the muscles of breathing.” became “Airways, lungs and the muscles of breathing.”. | Voies aériennes, bronches et muscles de la respiration. |
| `systemBlurb.nervous` | Lobes, deep nuclei, brainstem and ventricles. | “The brain, its lobes, deep nuclei and pathways.” became “Lobes, deep nuclei, brainstem and ventricles.”. | Le cerveau, ses lobes, ses noyaux profonds et ses voies. |
| `systemBlurb.digestive` | Mouth to rectum, with the liver, pancreas and spleen. | “From the tongue to the rectum, with the glands that feed it.” became “Mouth to rectum, with the liver, pancreas and spleen.”. | De la langue au rectum, avec les glandes qui l’alimentent. |
| `systemBlurb.reproductive` | Male reproductive organs and glands. The model is male. | “Male reproductive organs and glands (female anatomy in preparation).” became “Male reproductive organs and glands. The model is male.”. | Organes et glandes reproducteurs masculins (anatomie féminine en préparation). |
| `today.streakStart` | No streak yet | “Start a streak today” became “No streak yet”. | Lancez une série aujourd’hui |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | Reprendre l’entraînement |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | Erreurs à corriger |
| `today.noWeak` | No weak spots yet. Structures you get wrong appear here. | “Nothing weak yet. Your trouble spots will collect here as you practise.” became “No weak spots yet. Structures you get wrong appear here.”. | Rien pour l’instant. Vos points faibles apparaîtront ici au fil des séances. |
| `assignment.weekMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | Maîtriser {n} nouvelles structures |
| `assignment.monthMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | Maîtriser {n} nouvelles structures |
| `atlas.title` | All content | “Atlas” became “All content”. | Atlas |
| `atlas.mastered` | {n}% learned | “{n}% mastered” became “{n}% learned”. | {n} % maîtrisé |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | Programme |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | Examen |
| `mod.exploreSub` | Turn the model and tap a structure | “Rotate, zoom and tap any structure” became “Turn the model and tap a structure”. | Tournez, zoomez et touchez une structure |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | Mode |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | Niveau |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | Chrono par réponse |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | Région |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | Commencer |
| `practice.answerLang` | Type the English or Latin name. | “Type answers in English or Latin, the international terms.” became “Type the English or Latin name.”. | Tapez les réponses en anglais ou en latin, les termes internationaux. |
| `quiz.error` | Couldn’t load the {module} model. Check your connection and try again. | “Couldn’t load this module.” became “Couldn’t load the {module} model. Check your connection and try again.”. | Impossible de charger ce module. |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | Orthographe |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | Identifier |
| `mod.choiceSub` | Choose the name from four | “Name the highlighted structure from four” became “Choose the name from four”. | Nommer la structure mise en évidence parmi quatre |
| `mod.identifySub` | Tap the named structure on the model | “Find the named structure on the model and tap it” became “Tap the named structure on the model”. | Trouver la structure nommée sur le modèle et la toucher |
| `summary.session` | Quiz finished | “Session complete” became “Quiz finished”. | Séance terminée |
| `summary.exam` | Timed exam finished | “Timed exam complete” became “Timed exam finished”. | Examen terminé |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | Les corriger maintenant |
| `cards.done` | Deck finished | “Deck complete” became “Deck finished”. | Paquet terminé |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | Examens |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | Aucun examen pour l’instant. |
| `you.track` | Course | “Study track” became “Course”. | Filière |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | Chrono par défaut |
| `onb.sub` | Pick your course. You can change it at any time. | “See it in 3D, type what it is, learn why it’s there. A few minutes a day.” became “Pick your course. You can change it at any time.”. | Voyez-la en 3D, tapez son nom, comprenez pourquoi elle est là. Quelques minutes par jour. |
| `onb.start` | Start | “Start learning” became “Start”. | Commencer |
| `explore.help` | Drag to turn. Pinch to zoom. | “Drag to rotate · pinch to zoom · double-tap to reset” became “Drag to turn. Pinch to zoom.”. | Glisser pour tourner · pincer pour zoomer · double-toucher pour réinitialiser |
| `mock.lede` | Multiple-choice questions. Each answer is explained. | “Multiple-choice questions on the anatomy every student should know. Every answer is explained.” became “Multiple-choice questions. Each answer is explained.”. | Des questions à choix multiples, en anglais, sur l’anatomie que tout étudiant doit connaître. Chaque réponse est expliquée. |
| `mock.foundationHelp` | Bones, muscles, organs, body systems and anatomical terms. | “The essentials: bones, muscles, organs, body systems and the language of anatomy.” became “Bones, muscles, organs, body systems and anatomical terms.”. | L’essentiel : os, muscles, organes, systèmes du corps et vocabulaire de l’anatomie. |
| `mock.higherHelp` | Nerves, vertebral levels, surface landmarks and clinical anatomy. | “For top marks: nerves, vertebral levels, landmarks and what happens when things go wrong.” became “Nerves, vertebral levels, surface landmarks and clinical anatomy.”. | Pour viser haut : nerfs, niveaux vertébraux, repères et ce qui se passe quand quelque chose ne va pas. |
| `mock.finish` | See results | “See my results” became “See results”. | Voir mes résultats |
| `today.mockSub` | Foundation or Higher, 15 to 45 questions | “Foundation or Higher · 15 to 45 questions” became “Foundation or Higher, 15 to 45 questions”. | Fondamental ou Avancé · 15 à 45 questions |
| `body.sub` | Seven layers, from skin to bone | “Skin, muscles, bones, organs, arteries, veins and the brain, layer by layer” became “Seven layers, from skin to bone”. | Peau, muscles, os, organes, artères, veines et cerveau, couche par couche |
| `body.help.look` | Turn layers on and off. Tap a part to name it. | “Switch layers on and off below to peel the body from skin to bone. Tap any part to name it.” became “Turn layers on and off. Tap a part to name it.”. | Activez ou désactivez les couches ci-dessous pour passer de la peau aux os. Touchez une partie pour la nommer. |
| `body.help.xray` | Skin and muscles are see-through. Tap a part to name it. | “Skin and muscles are see-through, so you can see what lies beneath. Tap any part to name it.” became “Skin and muscles are see-through. Tap a part to name it.”. | La peau et les muscles deviennent transparents pour montrer ce qu’il y a dessous. Touchez une partie pour la nommer. |
| `body.help.separate` | Drag the slider to space the bones apart. | “Drag the slider to pull the bones apart and see each one. Only the bones are shown.” became “Drag the slider to space the bones apart.”. | Faites glisser le curseur pour écarter les os et les voir un à un. Seuls les os sont affichés. |
| `body.help.cut` | Drag the slider to move the cut. | “Slice the body in any plane, as in a CT or MRI scan. Drag the slider to move the cut.” became “Drag the slider to move the cut.”. | Coupez le corps dans n’importe quel plan, comme au scanner ou à l’IRM. Faites glisser le curseur pour déplacer la coupe. |
| `credits.desc` | Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model. | “Atlas is a typing-based anatomy trainer for nursing, medical, physiotherapy, dentistry and sports science students.” became “Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model.”. | Atlas est un entraîneur d’anatomie au clavier pour les étudiants en soins infirmiers, médecine, kinésithérapie, dentaire et sciences du sport. |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | Pas de publicité, pas de pistage, pas de compte. Votre progression reste sur cet appareil. |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | Chaque système, chaque structure, en 3D. |

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

### Missing: shown in English (103)

| Key | English |
| --- | --- |
| `common.retry` | Try again |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | {n} to answer again |
| `summary.result` | You got {a} of {b} right first time. |
| `summary.resultExam` | You got {a} of {b} without a mistake. |
| `cards.end` | End flashcards |
| `viewer.error` | Couldn’t load the 3D model. Check your connection and try again. |
| `viewer.loading` | Loading the 3D model |
| `mock.end` | Leave the mock exam |
| `mock.result` | You got {a} of {b}. |
| `mock.toReview` | {n} to review below. |
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
| `account.err.setup` | Sign-in isn’t available right now. Try again later. |
| `account.err.unknown` | Couldn’t reach the sign-in service. Check your connection and try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search by name, Latin name, topic or plate. British and American spellings both work. |
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
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Modules, plates and topics for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `credits.sounds` | Sounds |
| `today.forCourse` | For your course |
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

### English changed since it was translated (54)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | Atlas |
| `systemBlurb.skeletal` | Bones and bony landmarks. | “Bones and landmarks that frame and protect the body.” became “Bones and bony landmarks.”. | Knochen und Landmarken, die den Körper tragen und schützen. |
| `systemBlurb.muscular` | Muscles of the head, trunk and limbs. | “The muscles that move, hold and stabilise you.” became “Muscles of the head, trunk and limbs.”. | Die Muskeln, die dich bewegen, halten und stabilisieren. |
| `systemBlurb.cardiovascular` | The heart and the major blood vessels. | “The heart and the vessels that carry blood.” became “The heart and the major blood vessels.”. | Das Herz und die Gefäße, die das Blut transportieren. |
| `systemBlurb.respiratory` | Airways, lungs and the muscles of breathing. | “Airways, bronchi and the muscles of breathing.” became “Airways, lungs and the muscles of breathing.”. | Atemwege, Bronchien und Atemmuskulatur. |
| `systemBlurb.nervous` | Lobes, deep nuclei, brainstem and ventricles. | “The brain, its lobes, deep nuclei and pathways.” became “Lobes, deep nuclei, brainstem and ventricles.”. | Das Gehirn, seine Lappen, Kerne und Bahnen. |
| `systemBlurb.digestive` | Mouth to rectum, with the liver, pancreas and spleen. | “From the tongue to the rectum, with the glands that feed it.” became “Mouth to rectum, with the liver, pancreas and spleen.”. | Von der Zunge bis zum Rektum, mit den zugehörigen Drüsen. |
| `systemBlurb.reproductive` | Male reproductive organs and glands. The model is male. | “Male reproductive organs and glands (female anatomy in preparation).” became “Male reproductive organs and glands. The model is male.”. | Männliche Fortpflanzungsorgane und -drüsen (weibliche Anatomie in Vorbereitung). |
| `today.streakStart` | No streak yet | “Start a streak today” became “No streak yet”. | Starte heute eine Serie |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | Übung fortsetzen |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | Fehler zu korrigieren |
| `today.noWeak` | No weak spots yet. Structures you get wrong appear here. | “Nothing weak yet. Your trouble spots will collect here as you practise.” became “No weak spots yet. Structures you get wrong appear here.”. | Noch nichts. Deine Schwachstellen sammeln sich hier, während du übst. |
| `assignment.weekMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | {n} neue Strukturen meistern |
| `assignment.monthMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | {n} neue Strukturen meistern |
| `atlas.title` | All content | “Atlas” became “All content”. | Atlas |
| `atlas.mastered` | {n}% learned | “{n}% mastered” became “{n}% learned”. | {n} % gemeistert |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | Lehrplan |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | Prüfung |
| `mod.exploreSub` | Turn the model and tap a structure | “Rotate, zoom and tap any structure” became “Turn the model and tap a structure”. | Drehen, zoomen und Strukturen antippen |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | Modus |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | Niveau |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | Antwort-Timer |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | Region |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | Üben starten |
| `practice.answerLang` | Type the English or Latin name. | “Type answers in English or Latin, the international terms.” became “Type the English or Latin name.”. | Antworten auf Englisch oder Latein eingeben, den internationalen Fachbegriffen. |
| `quiz.error` | Couldn’t load the {module} model. Check your connection and try again. | “Couldn’t load this module.” became “Couldn’t load the {module} model. Check your connection and try again.”. | Dieses Modul konnte nicht geladen werden. |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | Schreiben |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | Erkennen |
| `mod.choiceSub` | Choose the name from four | “Name the highlighted structure from four” became “Choose the name from four”. | Die hervorgehobene Struktur aus vier auswählen |
| `mod.identifySub` | Tap the named structure on the model | “Find the named structure on the model and tap it” became “Tap the named structure on the model”. | Die genannte Struktur am Modell finden und antippen |
| `summary.session` | Quiz finished | “Session complete” became “Quiz finished”. | Sitzung beendet |
| `summary.exam` | Timed exam finished | “Timed exam complete” became “Timed exam finished”. | Prüfung beendet |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | Jetzt korrigieren |
| `cards.done` | Deck finished | “Deck complete” became “Deck finished”. | Stapel fertig |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | Prüfungen |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | Noch keine Prüfungen. |
| `you.track` | Course | “Study track” became “Course”. | Studienrichtung |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | Standard-Antwort-Timer |
| `onb.sub` | Pick your course. You can change it at any time. | “See it in 3D, type what it is, learn why it’s there. A few minutes a day.” became “Pick your course. You can change it at any time.”. | In 3D sehen, den Namen tippen, verstehen, warum sie da ist. Ein paar Minuten am Tag. |
| `onb.start` | Start | “Start learning” became “Start”. | Loslegen |
| `explore.help` | Drag to turn. Pinch to zoom. | “Drag to rotate · pinch to zoom · double-tap to reset” became “Drag to turn. Pinch to zoom.”. | Ziehen zum Drehen · Zwei Finger zum Zoomen · Doppeltippen zum Zurücksetzen |
| `mock.lede` | Multiple-choice questions. Each answer is explained. | “Multiple-choice questions on the anatomy every student should know. Every answer is explained.” became “Multiple-choice questions. Each answer is explained.”. | Multiple-Choice-Fragen auf Englisch zu der Anatomie, die alle Studierenden kennen sollten. Jede Antwort wird erklärt. |
| `mock.foundationHelp` | Bones, muscles, organs, body systems and anatomical terms. | “The essentials: bones, muscles, organs, body systems and the language of anatomy.” became “Bones, muscles, organs, body systems and anatomical terms.”. | Das Wichtigste: Knochen, Muskeln, Organe, Körpersysteme und die Sprache der Anatomie. |
| `mock.higherHelp` | Nerves, vertebral levels, surface landmarks and clinical anatomy. | “For top marks: nerves, vertebral levels, landmarks and what happens when things go wrong.” became “Nerves, vertebral levels, surface landmarks and clinical anatomy.”. | Für Bestnoten: Nerven, Wirbelhöhen, Orientierungspunkte und was passiert, wenn etwas schiefgeht. |
| `mock.finish` | See results | “See my results” became “See results”. | Ergebnis ansehen |
| `today.mockSub` | Foundation or Higher, 15 to 45 questions | “Foundation or Higher · 15 to 45 questions” became “Foundation or Higher, 15 to 45 questions”. | Grundlagen oder Fortgeschritten · 15 bis 45 Fragen |
| `body.sub` | Seven layers, from skin to bone | “Skin, muscles, bones, organs, arteries, veins and the brain, layer by layer” became “Seven layers, from skin to bone”. | Haut, Muskeln, Knochen, Organe, Arterien, Venen und Gehirn, Schicht für Schicht |
| `body.help.look` | Turn layers on and off. Tap a part to name it. | “Switch layers on and off below to peel the body from skin to bone. Tap any part to name it.” became “Turn layers on and off. Tap a part to name it.”. | Schalte unten Schichten ein und aus, um den Körper von der Haut bis zum Knochen freizulegen. Tippe auf ein Teil, um es zu benennen. |
| `body.help.xray` | Skin and muscles are see-through. Tap a part to name it. | “Skin and muscles are see-through, so you can see what lies beneath. Tap any part to name it.” became “Skin and muscles are see-through. Tap a part to name it.”. | Haut und Muskeln werden durchsichtig, damit du siehst, was darunter liegt. Tippe auf ein Teil, um es zu benennen. |
| `body.help.separate` | Drag the slider to space the bones apart. | “Drag the slider to pull the bones apart and see each one. Only the bones are shown.” became “Drag the slider to space the bones apart.”. | Ziehe den Regler, um die Knochen auseinanderzuziehen und jeden einzeln zu sehen. Es werden nur die Knochen gezeigt. |
| `body.help.cut` | Drag the slider to move the cut. | “Slice the body in any plane, as in a CT or MRI scan. Drag the slider to move the cut.” became “Drag the slider to move the cut.”. | Schneide den Körper in jeder Ebene, wie im CT oder MRT. Ziehe den Regler, um den Schnitt zu verschieben. |
| `credits.desc` | Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model. | “Atlas is a typing-based anatomy trainer for nursing, medical, physiotherapy, dentistry and sports science students.” became “Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model.”. | Atlas ist ein Anatomie-Trainer mit Tippen für Studierende der Pflege, Medizin, Physiotherapie, Zahnmedizin und Sportwissenschaft. |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | Keine Werbung, kein Tracking, kein Konto. Dein Fortschritt bleibt auf diesem Gerät. |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | Jedes System, jede Struktur, in 3D. |

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

### Missing: shown in English (103)

| Key | English |
| --- | --- |
| `common.retry` | Try again |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | {n} to answer again |
| `summary.result` | You got {a} of {b} right first time. |
| `summary.resultExam` | You got {a} of {b} without a mistake. |
| `cards.end` | End flashcards |
| `viewer.error` | Couldn’t load the 3D model. Check your connection and try again. |
| `viewer.loading` | Loading the 3D model |
| `mock.end` | Leave the mock exam |
| `mock.result` | You got {a} of {b}. |
| `mock.toReview` | {n} to review below. |
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
| `account.err.setup` | Sign-in isn’t available right now. Try again later. |
| `account.err.unknown` | Couldn’t reach the sign-in service. Check your connection and try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search by name, Latin name, topic or plate. British and American spellings both work. |
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
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Modules, plates and topics for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `credits.sounds` | Sounds |
| `today.forCourse` | For your course |
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

### English changed since it was translated (54)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | الأطلس |
| `systemBlurb.skeletal` | Bones and bony landmarks. | “Bones and landmarks that frame and protect the body.” became “Bones and bony landmarks.”. | العظام والمعالم التي تدعم الجسم وتحميه. |
| `systemBlurb.muscular` | Muscles of the head, trunk and limbs. | “The muscles that move, hold and stabilise you.” became “Muscles of the head, trunk and limbs.”. | العضلات التي تحرّكك وتثبّتك. |
| `systemBlurb.cardiovascular` | The heart and the major blood vessels. | “The heart and the vessels that carry blood.” became “The heart and the major blood vessels.”. | القلب والأوعية التي تنقل الدم. |
| `systemBlurb.respiratory` | Airways, lungs and the muscles of breathing. | “Airways, bronchi and the muscles of breathing.” became “Airways, lungs and the muscles of breathing.”. | المسالك الهوائية والقصبات وعضلات التنفس. |
| `systemBlurb.nervous` | Lobes, deep nuclei, brainstem and ventricles. | “The brain, its lobes, deep nuclei and pathways.” became “Lobes, deep nuclei, brainstem and ventricles.”. | الدماغ وفصوصه ونواه العميقة ومساراته. |
| `systemBlurb.digestive` | Mouth to rectum, with the liver, pancreas and spleen. | “From the tongue to the rectum, with the glands that feed it.” became “Mouth to rectum, with the liver, pancreas and spleen.”. | من اللسان إلى المستقيم مع الغدد الهضمية. |
| `systemBlurb.reproductive` | Male reproductive organs and glands. The model is male. | “Male reproductive organs and glands (female anatomy in preparation).” became “Male reproductive organs and glands. The model is male.”. | الأعضاء والغدد التناسلية الذكرية (التشريح الأنثوي قيد الإعداد). |
| `today.streakStart` | No streak yet | “Start a streak today” became “No streak yet”. | ابدأ سلسلة اليوم |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | متابعة التدريب |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | أخطاء لتصحيحها |
| `today.noWeak` | No weak spots yet. Structures you get wrong appear here. | “Nothing weak yet. Your trouble spots will collect here as you practise.” became “No weak spots yet. Structures you get wrong appear here.”. | لا شيء بعد. ستظهر نقاط ضعفك هنا مع التدريب. |
| `assignment.weekMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | أتقن {n} تراكيب جديدة |
| `assignment.monthMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | أتقن {n} تركيبًا جديدًا |
| `atlas.title` | All content | “Atlas” became “All content”. | الأطلس |
| `atlas.mastered` | {n}% learned | “{n}% mastered” became “{n}% learned”. | أُتقن {n}٪ |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | المنهج |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | اختبار |
| `mod.exploreSub` | Turn the model and tap a structure | “Rotate, zoom and tap any structure” became “Turn the model and tap a structure”. | دوّر وكبّر واضغط على أي تركيب |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | الوضع |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | المستوى |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | مؤقّت الإجابة |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | المنطقة |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | ابدأ التدريب |
| `practice.answerLang` | Type the English or Latin name. | “Type answers in English or Latin, the international terms.” became “Type the English or Latin name.”. | اكتب الإجابات بالإنجليزية أو اللاتينية، وهي المصطلحات الدولية. |
| `quiz.error` | Couldn’t load the {module} model. Check your connection and try again. | “Couldn’t load this module.” became “Couldn’t load the {module} model. Check your connection and try again.”. | تعذّر تحميل هذه الوحدة. |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | التهجئة |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | التعرّف |
| `mod.choiceSub` | Choose the name from four | “Name the highlighted structure from four” became “Choose the name from four”. | سمِّ التركيب المميَّز من بين أربعة |
| `mod.identifySub` | Tap the named structure on the model | “Find the named structure on the model and tap it” became “Tap the named structure on the model”. | ابحث عن التركيب المذكور على النموذج واضغط عليه |
| `summary.session` | Quiz finished | “Session complete” became “Quiz finished”. | انتهت الجلسة |
| `summary.exam` | Timed exam finished | “Timed exam complete” became “Timed exam finished”. | انتهى الاختبار |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | صحّحها الآن |
| `cards.done` | Deck finished | “Deck complete” became “Deck finished”. | اكتملت المجموعة |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | الاختبارات |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | لا اختبارات بعد. |
| `you.track` | Course | “Study track” became “Course”. | مسار الدراسة |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | مؤقّت الإجابة الافتراضي |
| `onb.sub` | Pick your course. You can change it at any time. | “See it in 3D, type what it is, learn why it’s there. A few minutes a day.” became “Pick your course. You can change it at any time.”. | شاهده ثلاثي الأبعاد، اكتب اسمه، واعرف لماذا هو هنا. دقائق قليلة يوميًا. |
| `onb.start` | Start | “Start learning” became “Start”. | ابدأ التعلّم |
| `explore.help` | Drag to turn. Pinch to zoom. | “Drag to rotate · pinch to zoom · double-tap to reset” became “Drag to turn. Pinch to zoom.”. | اسحب للتدوير · اقرص للتكبير · انقر مرتين لإعادة الضبط |
| `mock.lede` | Multiple-choice questions. Each answer is explained. | “Multiple-choice questions on the anatomy every student should know. Every answer is explained.” became “Multiple-choice questions. Each answer is explained.”. | أسئلة اختيار من متعدد، باللغة الإنجليزية، عن التشريح الذي يجب أن يعرفه كل طالب. كل إجابة مشروحة. |
| `mock.foundationHelp` | Bones, muscles, organs, body systems and anatomical terms. | “The essentials: bones, muscles, organs, body systems and the language of anatomy.” became “Bones, muscles, organs, body systems and anatomical terms.”. | الأساسيات: العظام والعضلات والأعضاء وأجهزة الجسم ولغة التشريح. |
| `mock.higherHelp` | Nerves, vertebral levels, surface landmarks and clinical anatomy. | “For top marks: nerves, vertebral levels, landmarks and what happens when things go wrong.” became “Nerves, vertebral levels, surface landmarks and clinical anatomy.”. | للدرجات العليا: الأعصاب ومستويات الفقرات والمعالم وما يحدث عند حدوث خلل. |
| `mock.finish` | See results | “See my results” became “See results”. | اعرض نتيجتي |
| `today.mockSub` | Foundation or Higher, 15 to 45 questions | “Foundation or Higher · 15 to 45 questions” became “Foundation or Higher, 15 to 45 questions”. | أساسي أو متقدم · من 15 إلى 45 سؤالًا |
| `body.sub` | Seven layers, from skin to bone | “Skin, muscles, bones, organs, arteries, veins and the brain, layer by layer” became “Seven layers, from skin to bone”. | الجلد والعضلات والعظام والأعضاء والشرايين والأوردة والدماغ، طبقة بعد طبقة |
| `body.help.look` | Turn layers on and off. Tap a part to name it. | “Switch layers on and off below to peel the body from skin to bone. Tap any part to name it.” became “Turn layers on and off. Tap a part to name it.”. | شغّل الطبقات أو أوقفها بالأسفل لتكشف الجسم من الجلد إلى العظم. اضغط على أي جزء لمعرفة اسمه. |
| `body.help.xray` | Skin and muscles are see-through. Tap a part to name it. | “Skin and muscles are see-through, so you can see what lies beneath. Tap any part to name it.” became “Skin and muscles are see-through. Tap a part to name it.”. | يصبح الجلد والعضلات شفافة لترى ما تحتها. اضغط على أي جزء لمعرفة اسمه. |
| `body.help.separate` | Drag the slider to space the bones apart. | “Drag the slider to pull the bones apart and see each one. Only the bones are shown.” became “Drag the slider to space the bones apart.”. | اسحب المؤشر لتفصل العظام وترى كل عظم وحده. تُعرض العظام فقط. |
| `body.help.cut` | Drag the slider to move the cut. | “Slice the body in any plane, as in a CT or MRI scan. Drag the slider to move the cut.” became “Drag the slider to move the cut.”. | اقطع الجسم في أي مستوى، كما في التصوير المقطعي أو الرنين المغناطيسي. اسحب المؤشر لتحريك المقطع. |
| `credits.desc` | Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model. | “Atlas is a typing-based anatomy trainer for nursing, medical, physiotherapy, dentistry and sports science students.” became “Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model.”. | أطلس مدرّب تشريح بالكتابة لطلاب التمريض والطب والعلاج الطبيعي وطب الأسنان وعلوم الرياضة. |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | بلا إعلانات ولا تتبّع ولا حسابات. يبقى تقدّمك على هذا الجهاز فقط. |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | كل جهاز وكل تركيب، ثلاثي الأبعاد. |

### Identical to English (1): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greetingAlone` | {g}. |

## Russian (`ru`)

### Missing: shown in English (103)

| Key | English |
| --- | --- |
| `common.retry` | Try again |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | {n} to answer again |
| `summary.result` | You got {a} of {b} right first time. |
| `summary.resultExam` | You got {a} of {b} without a mistake. |
| `cards.end` | End flashcards |
| `viewer.error` | Couldn’t load the 3D model. Check your connection and try again. |
| `viewer.loading` | Loading the 3D model |
| `mock.end` | Leave the mock exam |
| `mock.result` | You got {a} of {b}. |
| `mock.toReview` | {n} to review below. |
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
| `account.err.setup` | Sign-in isn’t available right now. Try again later. |
| `account.err.unknown` | Couldn’t reach the sign-in service. Check your connection and try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search by name, Latin name, topic or plate. British and American spellings both work. |
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
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Modules, plates and topics for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `credits.sounds` | Sounds |
| `today.forCourse` | For your course |
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

### English changed since it was translated (54)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | Атлас |
| `systemBlurb.skeletal` | Bones and bony landmarks. | “Bones and landmarks that frame and protect the body.” became “Bones and bony landmarks.”. | Кости и ориентиры, которые держат и защищают тело. |
| `systemBlurb.muscular` | Muscles of the head, trunk and limbs. | “The muscles that move, hold and stabilise you.” became “Muscles of the head, trunk and limbs.”. | Мышцы, которые двигают, удерживают и стабилизируют тело. |
| `systemBlurb.cardiovascular` | The heart and the major blood vessels. | “The heart and the vessels that carry blood.” became “The heart and the major blood vessels.”. | Сердце и сосуды, по которым течёт кровь. |
| `systemBlurb.respiratory` | Airways, lungs and the muscles of breathing. | “Airways, bronchi and the muscles of breathing.” became “Airways, lungs and the muscles of breathing.”. | Дыхательные пути, бронхи и дыхательные мышцы. |
| `systemBlurb.nervous` | Lobes, deep nuclei, brainstem and ventricles. | “The brain, its lobes, deep nuclei and pathways.” became “Lobes, deep nuclei, brainstem and ventricles.”. | Головной мозг: доли, глубокие ядра и проводящие пути. |
| `systemBlurb.digestive` | Mouth to rectum, with the liver, pancreas and spleen. | “From the tongue to the rectum, with the glands that feed it.” became “Mouth to rectum, with the liver, pancreas and spleen.”. | От языка до прямой кишки, вместе с пищеварительными железами. |
| `systemBlurb.reproductive` | Male reproductive organs and glands. The model is male. | “Male reproductive organs and glands (female anatomy in preparation).” became “Male reproductive organs and glands. The model is male.”. | Мужские половые органы и железы (женская анатомия в подготовке). |
| `today.streakStart` | No streak yet | “Start a streak today” became “No streak yet”. | Начните серию сегодня |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | Продолжить практику |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | Ошибок исправить |
| `today.noWeak` | No weak spots yet. Structures you get wrong appear here. | “Nothing weak yet. Your trouble spots will collect here as you practise.” became “No weak spots yet. Structures you get wrong appear here.”. | Пока ничего. Ваши слабые места будут собираться здесь по мере практики. |
| `assignment.weekMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | Освоить новые структуры: {n} |
| `assignment.monthMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | Освоить новые структуры: {n} |
| `atlas.title` | All content | “Atlas” became “All content”. | Атлас |
| `atlas.mastered` | {n}% learned | “{n}% mastered” became “{n}% learned”. | освоено {n} % |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | Программа |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | Экзамен |
| `mod.exploreSub` | Turn the model and tap a structure | “Rotate, zoom and tap any structure” became “Turn the model and tap a structure”. | Вращайте, приближайте и нажимайте на структуры |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | Режим |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | Уровень |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | Таймер ответа |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | Область |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | Начать практику |
| `practice.answerLang` | Type the English or Latin name. | “Type answers in English or Latin, the international terms.” became “Type the English or Latin name.”. | Ответы вводятся на английском или латыни — международными терминами. |
| `quiz.error` | Couldn’t load the {module} model. Check your connection and try again. | “Couldn’t load this module.” became “Couldn’t load the {module} model. Check your connection and try again.”. | Не удалось загрузить модуль. |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | Написание |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | Найти на модели |
| `mod.choiceSub` | Choose the name from four | “Name the highlighted structure from four” became “Choose the name from four”. | Назовите выделенную структуру из четырёх вариантов |
| `mod.identifySub` | Tap the named structure on the model | “Find the named structure on the model and tap it” became “Tap the named structure on the model”. | Найдите названную структуру на модели и коснитесь её |
| `summary.session` | Quiz finished | “Session complete” became “Quiz finished”. | Занятие завершено |
| `summary.exam` | Timed exam finished | “Timed exam complete” became “Timed exam finished”. | Экзамен завершён |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | Исправить сейчас |
| `cards.done` | Deck finished | “Deck complete” became “Deck finished”. | Колода пройдена |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | Экзамены |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | Экзаменов пока нет. |
| `you.track` | Course | “Study track” became “Course”. | Направление |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | Таймер по умолчанию |
| `onb.sub` | Pick your course. You can change it at any time. | “See it in 3D, type what it is, learn why it’s there. A few minutes a day.” became “Pick your course. You can change it at any time.”. | Смотрите в 3D, вводите название, узнавайте, зачем она нужна. Несколько минут в день. |
| `onb.start` | Start | “Start learning” became “Start”. | Начать обучение |
| `explore.help` | Drag to turn. Pinch to zoom. | “Drag to rotate · pinch to zoom · double-tap to reset” became “Drag to turn. Pinch to zoom.”. | Проведите, чтобы вращать · сведите пальцы для масштаба · двойное касание — сброс |
| `mock.lede` | Multiple-choice questions. Each answer is explained. | “Multiple-choice questions on the anatomy every student should know. Every answer is explained.” became “Multiple-choice questions. Each answer is explained.”. | Вопросы с выбором ответа (на английском) по анатомии, которую должен знать каждый студент. Каждый ответ объясняется. |
| `mock.foundationHelp` | Bones, muscles, organs, body systems and anatomical terms. | “The essentials: bones, muscles, organs, body systems and the language of anatomy.” became “Bones, muscles, organs, body systems and anatomical terms.”. | Самое главное: кости, мышцы, органы, системы организма и язык анатомии. |
| `mock.higherHelp` | Nerves, vertebral levels, surface landmarks and clinical anatomy. | “For top marks: nerves, vertebral levels, landmarks and what happens when things go wrong.” became “Nerves, vertebral levels, surface landmarks and clinical anatomy.”. | Для высших баллов: нервы, уровни позвонков, ориентиры и что происходит при нарушениях. |
| `mock.finish` | See results | “See my results” became “See results”. | Посмотреть результат |
| `today.mockSub` | Foundation or Higher, 15 to 45 questions | “Foundation or Higher · 15 to 45 questions” became “Foundation or Higher, 15 to 45 questions”. | Базовый или продвинутый · от 15 до 45 вопросов |
| `body.sub` | Seven layers, from skin to bone | “Skin, muscles, bones, organs, arteries, veins and the brain, layer by layer” became “Seven layers, from skin to bone”. | Кожа, мышцы, кости, органы, артерии, вены и мозг, слой за слоем |
| `body.help.look` | Turn layers on and off. Tap a part to name it. | “Switch layers on and off below to peel the body from skin to bone. Tap any part to name it.” became “Turn layers on and off. Tap a part to name it.”. | Включайте и выключайте слои внизу, чтобы снять тело от кожи до костей. Нажмите на любую часть, чтобы узнать её название. |
| `body.help.xray` | Skin and muscles are see-through. Tap a part to name it. | “Skin and muscles are see-through, so you can see what lies beneath. Tap any part to name it.” became “Skin and muscles are see-through. Tap a part to name it.”. | Кожа и мышцы становятся прозрачными, чтобы было видно, что под ними. Нажмите на любую часть, чтобы узнать её название. |
| `body.help.separate` | Drag the slider to space the bones apart. | “Drag the slider to pull the bones apart and see each one. Only the bones are shown.” became “Drag the slider to space the bones apart.”. | Двигайте ползунок, чтобы разнести кости и рассмотреть каждую. Показаны только кости. |
| `body.help.cut` | Drag the slider to move the cut. | “Slice the body in any plane, as in a CT or MRI scan. Drag the slider to move the cut.” became “Drag the slider to move the cut.”. | Разрежьте тело в любой плоскости, как на КТ или МРТ. Двигайте ползунок, чтобы переместить срез. |
| `credits.desc` | Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model. | “Atlas is a typing-based anatomy trainer for nursing, medical, physiotherapy, dentistry and sports science students.” became “Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model.”. | Атлас — тренажёр анатомии с вводом названий для студентов сестринского дела, медицины, физиотерапии, стоматологии и спортивной науки. |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | Без рекламы, слежки и аккаунтов. Ваш прогресс хранится только на этом устройстве. |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | Каждая система, каждая структура — в 3D. |

### Identical to English (2): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greeting` | {g}, {name}. |
| `today.greetingAlone` | {g}. |

## Chinese (`zh`)

### Missing: shown in English (103)

| Key | English |
| --- | --- |
| `common.retry` | Try again |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | {n} to answer again |
| `summary.result` | You got {a} of {b} right first time. |
| `summary.resultExam` | You got {a} of {b} without a mistake. |
| `cards.end` | End flashcards |
| `viewer.error` | Couldn’t load the 3D model. Check your connection and try again. |
| `viewer.loading` | Loading the 3D model |
| `mock.end` | Leave the mock exam |
| `mock.result` | You got {a} of {b}. |
| `mock.toReview` | {n} to review below. |
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
| `account.err.setup` | Sign-in isn’t available right now. Try again later. |
| `account.err.unknown` | Couldn’t reach the sign-in service. Check your connection and try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search by name, Latin name, topic or plate. British and American spellings both work. |
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
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Modules, plates and topics for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `credits.sounds` | Sounds |
| `today.forCourse` | For your course |
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

### English changed since it was translated (54)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | 图谱 |
| `systemBlurb.skeletal` | Bones and bony landmarks. | “Bones and landmarks that frame and protect the body.” became “Bones and bony landmarks.”. | 支撑并保护身体的骨骼与骨性标志。 |
| `systemBlurb.muscular` | Muscles of the head, trunk and limbs. | “The muscles that move, hold and stabilise you.” became “Muscles of the head, trunk and limbs.”. | 让你运动、保持姿势和稳定的肌肉。 |
| `systemBlurb.cardiovascular` | The heart and the major blood vessels. | “The heart and the vessels that carry blood.” became “The heart and the major blood vessels.”. | 心脏以及输送血液的血管。 |
| `systemBlurb.respiratory` | Airways, lungs and the muscles of breathing. | “Airways, bronchi and the muscles of breathing.” became “Airways, lungs and the muscles of breathing.”. | 气道、支气管和呼吸肌。 |
| `systemBlurb.nervous` | Lobes, deep nuclei, brainstem and ventricles. | “The brain, its lobes, deep nuclei and pathways.” became “Lobes, deep nuclei, brainstem and ventricles.”. | 大脑的脑叶、深部核团和传导通路。 |
| `systemBlurb.digestive` | Mouth to rectum, with the liver, pancreas and spleen. | “From the tongue to the rectum, with the glands that feed it.” became “Mouth to rectum, with the liver, pancreas and spleen.”. | 从舌到直肠，以及相关的消化腺。 |
| `systemBlurb.reproductive` | Male reproductive organs and glands. The model is male. | “Male reproductive organs and glands (female anatomy in preparation).” became “Male reproductive organs and glands. The model is male.”. | 男性生殖器官与腺体（女性解剖准备中）。 |
| `today.streakStart` | No streak yet | “Start a streak today” became “No streak yet”. | 今天开始连续学习 |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | 继续练习 |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | 待纠正错误 |
| `today.noWeak` | No weak spots yet. Structures you get wrong appear here. | “Nothing weak yet. Your trouble spots will collect here as you practise.” became “No weak spots yet. Structures you get wrong appear here.”. | 暂时没有。练习后，你的薄弱点会显示在这里。 |
| `assignment.weekMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | 掌握 {n} 个新结构 |
| `assignment.monthMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | 掌握 {n} 个新结构 |
| `atlas.title` | All content | “Atlas” became “All content”. | 图谱 |
| `atlas.mastered` | {n}% learned | “{n}% mastered” became “{n}% learned”. | 已掌握 {n}% |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | 课程 |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | 测验 |
| `mod.exploreSub` | Turn the model and tap a structure | “Rotate, zoom and tap any structure” became “Turn the model and tap a structure”. | 旋转、缩放并点击任意结构 |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | 模式 |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | 难度 |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | 答题计时 |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | 区域 |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | 开始练习 |
| `practice.answerLang` | Type the English or Latin name. | “Type answers in English or Latin, the international terms.” became “Type the English or Latin name.”. | 请用英文或拉丁文（国际通用术语）输入答案。 |
| `quiz.error` | Couldn’t load the {module} model. Check your connection and try again. | “Couldn’t load this module.” became “Couldn’t load the {module} model. Check your connection and try again.”. | 无法加载此模块。 |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | 拼写 |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | 识别 |
| `mod.choiceSub` | Choose the name from four | “Name the highlighted structure from four” became “Choose the name from four”. | 从四个选项中说出高亮的结构 |
| `mod.identifySub` | Tap the named structure on the model | “Find the named structure on the model and tap it” became “Tap the named structure on the model”. | 在模型上找到所给结构并点按 |
| `summary.session` | Quiz finished | “Session complete” became “Quiz finished”. | 练习完成 |
| `summary.exam` | Timed exam finished | “Timed exam complete” became “Timed exam finished”. | 测验完成 |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | 现在纠正 |
| `cards.done` | Deck finished | “Deck complete” became “Deck finished”. | 本组完成 |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | 测验 |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | 暂无测验。 |
| `you.track` | Course | “Study track” became “Course”. | 学习方向 |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | 默认答题计时 |
| `onb.sub` | Pick your course. You can change it at any time. | “See it in 3D, type what it is, learn why it’s there. A few minutes a day.” became “Pick your course. You can change it at any time.”. | 在 3D 中观察，输入名称，了解它存在的原因。每天几分钟。 |
| `onb.start` | Start | “Start learning” became “Start”. | 开始学习 |
| `explore.help` | Drag to turn. Pinch to zoom. | “Drag to rotate · pinch to zoom · double-tap to reset” became “Drag to turn. Pinch to zoom.”. | 拖动旋转 · 双指缩放 · 双击复位 |
| `mock.lede` | Multiple-choice questions. Each answer is explained. | “Multiple-choice questions on the anatomy every student should know. Every answer is explained.” became “Multiple-choice questions. Each answer is explained.”. | 每个学生都应掌握的解剖学选择题（英文）。每个答案都有解释。 |
| `mock.foundationHelp` | Bones, muscles, organs, body systems and anatomical terms. | “The essentials: bones, muscles, organs, body systems and the language of anatomy.” became “Bones, muscles, organs, body systems and anatomical terms.”. | 核心知识：骨骼、肌肉、器官、身体系统和解剖学术语。 |
| `mock.higherHelp` | Nerves, vertebral levels, surface landmarks and clinical anatomy. | “For top marks: nerves, vertebral levels, landmarks and what happens when things go wrong.” became “Nerves, vertebral levels, surface landmarks and clinical anatomy.”. | 冲刺高分：神经、椎骨平面、体表标志，以及出现问题时会发生什么。 |
| `mock.finish` | See results | “See my results” became “See results”. | 查看我的成绩 |
| `today.mockSub` | Foundation or Higher, 15 to 45 questions | “Foundation or Higher · 15 to 45 questions” became “Foundation or Higher, 15 to 45 questions”. | 基础或进阶 · 15 至 45 题 |
| `body.sub` | Seven layers, from skin to bone | “Skin, muscles, bones, organs, arteries, veins and the brain, layer by layer” became “Seven layers, from skin to bone”. | 皮肤、肌肉、骨骼、器官、动脉、静脉和大脑，逐层查看 |
| `body.help.look` | Turn layers on and off. Tap a part to name it. | “Switch layers on and off below to peel the body from skin to bone. Tap any part to name it.” became “Turn layers on and off. Tap a part to name it.”. | 在下方开关各层，从皮肤一层层看到骨骼。点按任意部位查看名称。 |
| `body.help.xray` | Skin and muscles are see-through. Tap a part to name it. | “Skin and muscles are see-through, so you can see what lies beneath. Tap any part to name it.” became “Skin and muscles are see-through. Tap a part to name it.”. | 皮肤和肌肉变为半透明，可以看到下面的结构。点按任意部位查看名称。 |
| `body.help.separate` | Drag the slider to space the bones apart. | “Drag the slider to pull the bones apart and see each one. Only the bones are shown.” became “Drag the slider to space the bones apart.”. | 拖动滑块把骨骼分开，逐一查看。此时只显示骨骼。 |
| `body.help.cut` | Drag the slider to move the cut. | “Slice the body in any plane, as in a CT or MRI scan. Drag the slider to move the cut.” became “Drag the slider to move the cut.”. | 在任意平面剖开人体，就像 CT 或 MRI。拖动滑块移动剖面。 |
| `credits.desc` | Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model. | “Atlas is a typing-based anatomy trainer for nursing, medical, physiotherapy, dentistry and sports science students.” became “Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model.”. | Atlas 是一款通过输入名称来学习解剖学的应用，适合护理、临床医学、物理治疗、口腔医学和运动科学专业的学生。 |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | 没有广告、没有追踪、无需账号。你的进度只保存在本设备上。 |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | 每个系统、每个结构，均为 3D。 |

### Identical to English (0): check whether this is intended

None.

## Korean (`ko`)

### Missing: shown in English (103)

| Key | English |
| --- | --- |
| `common.retry` | Try again |
| `common.studyAid` | Atlas is a study aid for education only. It is not clinical guidance. Always follow your course materials and local clinical policy. |
| `atlas.focus` | Short modules |
| `mod.settingsNote` | These settings apply to the three tests below. |
| `mod.more` | Exam and review |
| `mod.mistakesSub` | {n} to answer again |
| `summary.result` | You got {a} of {b} right first time. |
| `summary.resultExam` | You got {a} of {b} without a mistake. |
| `cards.end` | End flashcards |
| `viewer.error` | Couldn’t load the 3D model. Check your connection and try again. |
| `viewer.loading` | Loading the 3D model |
| `mock.end` | Leave the mock exam |
| `mock.result` | You got {a} of {b}. |
| `mock.toReview` | {n} to review below. |
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
| `account.err.setup` | Sign-in isn’t available right now. Try again later. |
| `account.err.unknown` | Couldn’t reach the sign-in service. Check your connection and try again. |
| `search.open` | Search |
| `search.title` | Search |
| `search.label` | Search Atlas |
| `search.placeholder` | Femur, oesophagus, pulse points… |
| `search.hint` | Search by name, Latin name, topic or plate. British and American spellings both work. |
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
| `today.topics` | Topics for your course |
| `today.allTopics` | All topics in these categories |
| `today.plates` | Plates for your course |
| `today.allContent` | All content |
| `today.allContentSub` | Modules, plates and topics for every course |
| `mock.from` | Questions from |
| `mock.courseTopics` | Your course |
| `mock.allTopics` | All topics |
| `mock.available` | {n} questions available |
| `mock.oneTopic` | This topic |
| `credits.sounds` | Sounds |
| `today.forCourse` | For your course |
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

### English changed since it was translated (54)

| Key | Current English | Change | Current translation |
| --- | --- | --- | --- |
| `tab.atlas` | All content | “Atlas” became “All content” (the tab and the page are now one list of everything). | 아틀라스 |
| `systemBlurb.skeletal` | Bones and bony landmarks. | “Bones and landmarks that frame and protect the body.” became “Bones and bony landmarks.”. | 몸을 지탱하고 보호하는 뼈와 뼈 표지. |
| `systemBlurb.muscular` | Muscles of the head, trunk and limbs. | “The muscles that move, hold and stabilise you.” became “Muscles of the head, trunk and limbs.”. | 몸을 움직이고 지탱하며 안정시키는 근육. |
| `systemBlurb.cardiovascular` | The heart and the major blood vessels. | “The heart and the vessels that carry blood.” became “The heart and the major blood vessels.”. | 심장과 혈액을 운반하는 혈관. |
| `systemBlurb.respiratory` | Airways, lungs and the muscles of breathing. | “Airways, bronchi and the muscles of breathing.” became “Airways, lungs and the muscles of breathing.”. | 기도, 기관지, 호흡 근육. |
| `systemBlurb.nervous` | Lobes, deep nuclei, brainstem and ventricles. | “The brain, its lobes, deep nuclei and pathways.” became “Lobes, deep nuclei, brainstem and ventricles.”. | 뇌의 엽, 심부 핵, 전도로. |
| `systemBlurb.digestive` | Mouth to rectum, with the liver, pancreas and spleen. | “From the tongue to the rectum, with the glands that feed it.” became “Mouth to rectum, with the liver, pancreas and spleen.”. | 혀에서 직장까지, 그리고 소화샘. |
| `systemBlurb.reproductive` | Male reproductive organs and glands. The model is male. | “Male reproductive organs and glands (female anatomy in preparation).” became “Male reproductive organs and glands. The model is male.”. | 남성 생식 기관과 샘(여성 해부학 준비 중). |
| `today.streakStart` | No streak yet | “Start a streak today” became “No streak yet”. | 오늘 연속 학습을 시작하세요 |
| `today.resumeGo` | Continue spelling quiz | “Resume practice” became “Continue spelling quiz”. | 연습 이어서 하기 |
| `today.mistakes` | Fix mistakes | “Mistakes to fix” became “Fix mistakes” (one name for the feature). | 고칠 오답 |
| `today.noWeak` | No weak spots yet. Structures you get wrong appear here. | “Nothing weak yet. Your trouble spots will collect here as you practise.” became “No weak spots yet. Structures you get wrong appear here.”. | 아직 없어요. 연습할수록 약점이 여기에 모여요. |
| `assignment.weekMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | 새 구조 {n}개 익히기 |
| `assignment.monthMaster` | Learn {n} new structures | “Master {n} new structures” became “Learn {n} new structures”. | 새 구조 {n}개 익히기 |
| `atlas.title` | All content | “Atlas” became “All content”. | 아틀라스 |
| `atlas.mastered` | {n}% learned | “{n}% mastered” became “{n}% learned”. | {n}% 익힘 |
| `atlas.curriculum` | Topics | “Curriculum” became “Topics” (one name for curriculum topics everywhere). | 교육과정 |
| `mod.exam` | Timed exam | “Exam” became “Timed exam”. | 시험 |
| `mod.exploreSub` | Turn the model and tap a structure | “Rotate, zoom and tap any structure” became “Turn the model and tap a structure”. | 회전, 확대, 구조를 탭하세요 |
| `practice.mode` | Difficulty | “Mode” became “Difficulty”. | 모드 |
| `practice.level` | Structures | “Level” became “Structures” (choose foundation, intermediate or advanced structures). | 난이도 |
| `practice.timer` | Time per answer | “Answer timer” became “Time per answer”. | 답변 타이머 |
| `practice.region` | Questions from | “Region” became “Questions from” (a part of the module, not a regional module). | 부위 |
| `practice.start` | Start spelling quiz | “Start practice” became “Start spelling quiz”. | 연습 시작 |
| `practice.answerLang` | Type the English or Latin name. | “Type answers in English or Latin, the international terms.” became “Type the English or Latin name.”. | 답은 국제 용어인 영어나 라틴어로 입력하세요. |
| `quiz.error` | Couldn’t load the {module} model. Check your connection and try again. | “Couldn’t load this module.” became “Couldn’t load the {module} model. Check your connection and try again.”. | 이 모듈을 불러올 수 없어요. |
| `format.type` | Spelling quiz | “Spelling” became “Spelling quiz”. | 철자 |
| `format.identify` | Identify on the model | “Identify” became “Identify on the model”. | 찾기 |
| `mod.choiceSub` | Choose the name from four | “Name the highlighted structure from four” became “Choose the name from four”. | 네 개 중에서 강조된 구조를 고르세요 |
| `mod.identifySub` | Tap the named structure on the model | “Find the named structure on the model and tap it” became “Tap the named structure on the model”. | 모델에서 이름의 구조를 찾아 누르세요 |
| `summary.session` | Quiz finished | “Session complete” became “Quiz finished”. | 세션 완료 |
| `summary.exam` | Timed exam finished | “Timed exam complete” became “Timed exam finished”. | 시험 완료 |
| `summary.fix` | Fix mistakes | “Fix these now” became “Fix mistakes” (one name for the feature). | 지금 고치기 |
| `cards.done` | Deck finished | “Deck complete” became “Deck finished”. | 카드 묶음 완료 |
| `progress.exams` | Timed and mock exams | “Exams” became “Timed and mock exams”. | 시험 |
| `progress.noExams` | No timed or mock exams yet. | “No exams yet.” became “No timed or mock exams yet.” | 아직 본 시험이 없어요. |
| `you.track` | Course | “Study track” became “Course”. | 전공 |
| `you.timer` | Default time per answer | “Default answer timer” became “Default time per answer”. | 기본 답변 타이머 |
| `onb.sub` | Pick your course. You can change it at any time. | “See it in 3D, type what it is, learn why it’s there. A few minutes a day.” became “Pick your course. You can change it at any time.”. | 3D로 보고, 이름을 입력하고, 왜 거기 있는지 배우세요. 하루 몇 분이면 돼요. |
| `onb.start` | Start | “Start learning” became “Start”. | 학습 시작 |
| `explore.help` | Drag to turn. Pinch to zoom. | “Drag to rotate · pinch to zoom · double-tap to reset” became “Drag to turn. Pinch to zoom.”. | 드래그로 회전 · 핀치로 확대 · 두 번 탭해 초기화 |
| `mock.lede` | Multiple-choice questions. Each answer is explained. | “Multiple-choice questions on the anatomy every student should know. Every answer is explained.” became “Multiple-choice questions. Each answer is explained.”. | 모든 학생이 알아야 할 해부학 객관식 문제(영어)예요. 모든 답에 해설이 있어요. |
| `mock.foundationHelp` | Bones, muscles, organs, body systems and anatomical terms. | “The essentials: bones, muscles, organs, body systems and the language of anatomy.” became “Bones, muscles, organs, body systems and anatomical terms.”. | 핵심: 뼈, 근육, 장기, 인체 계통과 해부학 용어. |
| `mock.higherHelp` | Nerves, vertebral levels, surface landmarks and clinical anatomy. | “For top marks: nerves, vertebral levels, landmarks and what happens when things go wrong.” became “Nerves, vertebral levels, surface landmarks and clinical anatomy.”. | 고득점을 위해: 신경, 척추 높이, 체표 지표, 문제가 생기면 일어나는 일. |
| `mock.finish` | See results | “See my results” became “See results”. | 결과 보기 |
| `today.mockSub` | Foundation or Higher, 15 to 45 questions | “Foundation or Higher · 15 to 45 questions” became “Foundation or Higher, 15 to 45 questions”. | 기초 또는 심화 · 15~45문항 |
| `body.sub` | Seven layers, from skin to bone | “Skin, muscles, bones, organs, arteries, veins and the brain, layer by layer” became “Seven layers, from skin to bone”. | 피부, 근육, 뼈, 장기, 동맥, 정맥과 뇌를 한 층씩 |
| `body.help.look` | Turn layers on and off. Tap a part to name it. | “Switch layers on and off below to peel the body from skin to bone. Tap any part to name it.” became “Turn layers on and off. Tap a part to name it.”. | 아래에서 층을 켜고 끄면 피부부터 뼈까지 볼 수 있어요. 아무 부위나 탭하면 이름이 나와요. |
| `body.help.xray` | Skin and muscles are see-through. Tap a part to name it. | “Skin and muscles are see-through, so you can see what lies beneath. Tap any part to name it.” became “Skin and muscles are see-through. Tap a part to name it.”. | 피부와 근육이 투명해져서 그 아래를 볼 수 있어요. 아무 부위나 탭하면 이름이 나와요. |
| `body.help.separate` | Drag the slider to space the bones apart. | “Drag the slider to pull the bones apart and see each one. Only the bones are shown.” became “Drag the slider to space the bones apart.”. | 슬라이더를 움직이면 뼈가 떨어져서 하나씩 볼 수 있어요. 뼈만 표시돼요. |
| `body.help.cut` | Drag the slider to move the cut. | “Slice the body in any plane, as in a CT or MRI scan. Drag the slider to move the cut.” became “Drag the slider to move the cut.”. | CT나 MRI처럼 원하는 면으로 몸을 잘라 볼 수 있어요. 슬라이더로 단면을 움직이세요. |
| `credits.desc` | Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model. | “Atlas is a typing-based anatomy trainer for nursing, medical, physiotherapy, dentistry and sports science students.” became “Atlas is an anatomy trainer: you learn each structure by typing its name on a 3D model.”. | Atlas는 간호학, 의학, 물리치료, 치의학, 스포츠과학 학생을 위한 타이핑 기반 해부학 학습 앱이에요. |
| `credits.privacyText` | No ads and no tracking. Without an account, your progress stays on this device. If you sign in, your email address and your progress (with your course, daily goal and name) are stored in Google Firebase so they follow you to your other devices. You can delete your account in Settings at any time. | Now explains accounts: without one, progress stays on the device; signed in, email and progress are stored in Google Firebase. | 광고, 추적, 계정이 없어요. 진도는 이 기기에만 저장돼요. |
| `atlas.sub` | The body in 3D, every module, plate, mock exam and topic, in one place. | New description of the All content page. | 모든 계통, 모든 구조를 3D로. |

### Identical to English (1): check whether this is intended

| Key | Text |
| --- | --- |
| `today.greetingAlone` | {g}. |
