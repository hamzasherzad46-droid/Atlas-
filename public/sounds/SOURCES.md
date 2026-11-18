# Sounds: sources and licences

Every sound in Atlas is a real recording, public domain or CC0, found on Wikimedia Commons. Each
file here is one strike cut from the original, filtered lightly, levelled to a peak of −3 dBFS and
saved as mono MP3 (96 kbps). In the app they play quietly, and every play varies pitch and volume
by up to ±3 % (`src/lib/sound.ts`).

| File | Plays when | Source | Author | Licence | Cut |
|---|---|---|---|---|---|
| `typewriter-key-1.mp3` … `typewriter-key-4.mp3` | A letter is typed (one of the four at random) | [Contact type (1).ogg](https://commons.wikimedia.org/wiki/File:Contact_type_(1).ogg), an Underwood typewriter recorded with a contact microphone; from PDSounds (no. 772) | pavlick | Public domain | 140 ms from 1.084 s, 2.812 s, 5.476 s and 5.736 s; high-pass 90 Hz |
| `desk-bell.mp3` | A right answer | [406243 stubb typewriter-ding-near-mono.wav](https://commons.wikimedia.org/wiki/File:406243_stubb_typewriter-ding-near-mono.wav), a typewriter's bell; from [Freesound](https://freesound.org/people/_stubb/sounds/406243/) | _stubb | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.016 s to 0.95 s |
| `wooden-tap.mp3` | A wrong key, or a wrong answer | [Knocking on wood or door.ogg](https://commons.wikimedia.org/wiki/File:Knocking_on_wood_or_door.ogg); from PDSounds (no. 198) | stephan | Public domain | One knock, 2.476 s to 2.612 s; low-pass 2.5 kHz to soften it |
| `page-turn.mp3` | A flashcard is turned over | [Turning a page.ogg](https://commons.wikimedia.org/wiki/File:Turning_a_page.ogg), a page of a hardback book; from PDSounds (no. 304) | planish | Public domain | 1.20 s to 2.58 s; high-pass 60 Hz |
| `rubber-stamp.mp3` | A mock exam is finished | Not yet chosen: Wikimedia Commons has no public-domain or CC0 rubber stamp. Until this file is added, the end of a mock exam is silent. | | | |

A finished quiz is deliberately silent: the results screen says enough.

To add or replace a sound, keep the file name, record its source, author, licence and cut in this
table, and add it to the Credits screen (`src/screens/CreditsScreen.tsx`).
