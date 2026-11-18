# Sounds: sources and licences

Every sound in Atlas except the typing click and the right-answer tick is a real recording, public
domain or CC0, found on Wikimedia Commons. Each file here is one strike cut from the original, filtered lightly, levelled to
a peak of −3 dBFS and saved as mono MP3 (96 kbps). In the app they play quietly, and every play
varies pitch and volume by up to ±3 % (`src/lib/sound.ts`).

Two sounds are made in the app, not recorded, from bursts of filtered noise (`src/lib/sound.ts`):

- the typing click: 12 ms, band-passed around 2.5 kHz and decaying fast, varied slightly on every key (`CLICK`);
- a right answer: a soft, airy tick, 70 ms, rising over 3 ms and fading, band-passed high and wide
  around 6.5 kHz (`TICK`).

| File | Plays when | Source | Author | Licence | Cut |
|---|---|---|---|---|---|
| `wooden-tap.mp3` | A wrong key, or a wrong answer | [Knocking on wood or door.ogg](https://commons.wikimedia.org/wiki/File:Knocking_on_wood_or_door.ogg); from PDSounds (no. 198) | stephan | Public domain | One knock, 2.476 s to 2.612 s; low-pass 2.5 kHz to soften it |
| `page-turn.mp3` | A flashcard is turned over | [Turning a page.ogg](https://commons.wikimedia.org/wiki/File:Turning_a_page.ogg), a page of a hardback book; from PDSounds (no. 304) | planish | Public domain | 1.20 s to 2.58 s; high-pass 60 Hz |
| `rubber-stamp.mp3` | A mock exam is finished | Not yet chosen: Wikimedia Commons has no public-domain or CC0 rubber stamp. Until this file is added, the end of a mock exam is silent. | | | |

A finished quiz is deliberately silent: the results screen says enough.

To add or replace a sound, keep the file name, record its source, author, licence and cut in this
table, and add it to the Credits screen (`src/screens/CreditsScreen.tsx`).
