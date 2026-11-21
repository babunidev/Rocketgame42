# Architecture

How the game, the desktop app and the web server fit together. The code is described as of 21 November 2026; the last section keeps earlier findings and what became of them.

## Overview

The game is plain browser HTML, JavaScript, CSS and SVG with no build step. It runs in three settings:

| Setting | Served by | High scores |
| --- | --- | --- |
| **Web**, [babuni.dev/Rocketgame42](https://babuni.dev/Rocketgame42/) | `source/server/rocketgame_server.py` behind nginx | Global top 100 in SQLite on the server |
| **Desktop**, Electron (`source/main.cjs`) | the custom `raketenspiel://` protocol | Local, in the app's data folder |
| **LAN**, Serve on Wi-Fi from the desktop app | a small HTTP server in `main.cjs`, port 4173 | Local, in each guest's browser |

The development command `npm run dev:web` serves `source/game/` with Python's static server and also uses local scores.

## Game modules

| File | Responsibility |
| --- | --- |
| `source/game/index.html` | Page shell, SVG stage, start/score screen, touch-control markup |
| `source/game/assets.js` | Recovered vector artwork (`window.RAKETENSPIEL_ASSETS`) |
| `source/game/runtime.js` | SVG scene graph imitating Flash clips, 48 Hz logic and drawing, mouse and touch input on the playfield, the `window.Raketenspiel` interface |
| `source/game/gameplay.js` | The translated Flash gameplay: ship, laser, asteroids, enemies, score, level |
| `source/game/missiles.js` | Seeker-missile stock, targeting, flight paths and hits |
| `source/game/highscores.js` + `.css` | Welcome and game-over screens, name entry, global or local board |
| `source/game/touch.js` + `.css` | On-screen steering pad, LASER and ROCKETS buttons |
| `source/game/sfx.js` | Sound playback; MP3 where Ogg can't play |
| `source/game/wifi.js` | Serve on Wi-Fi panel, only when the Electron bridge exists |

The game says it is a reconstruction and contains no SWF interpreter. Logic steps at 48 Hz, scaled from the original 16 FPS. `runtime.js` exposes `window.Raketenspiel` with `reset`, `play`, `pause`, `press`/`release` (laser), `steer(x)` and `fireMissiles()`. `highscores.js` and `touch.js` drive the game through it. On the playfield, touch pointers only steer, while mouse pointers steer and fire as before.

## High scores

`highscores.js` asks `api/scores` when the page comes over `http(s)`. If the server answers, the welcome and game-over screens show the global list and new scores are posted there. If not, which is the case in Electron, Serve on Wi-Fi and static servers, the game uses the local list in `localStorage` (`raketenspiel.highscores.v1`). The last name entered is remembered per browser. Both lists sort by points, then level, then the earlier run.

## Web server

`source/server/rocketgame_server.py` (Python standard library) serves the built game folder and `GET`/`POST api/scores` under `/Rocketgame42/` on `127.0.0.1:8788`, behind the babuni.dev nginx site. It keeps the best 100 runs in `/var/lib/rocketgame42/scores.sqlite3`, cleans names, bounds points and levels, and limits each address to 20 submissions a minute. Releases live in `/var/www/rocketgame42/releases/` with a `current` link. `build-web.sh` assembles a release, adding MP3 copies of the sounds, and `publish.sh` tests, uploads, switches and verifies it. Deployment, limits and administration: [source/server/README.md](../source/server/README.md). Tests: `source/tests/test_public_server.py`.

## Desktop app

`source/main.cjs` opens a fixed-size window on a restricted `raketenspiel://` protocol that serves only listed game files. It blocks external requests and uses context isolation, a sandbox and no Node integration. A fixed origin keeps portable score data when the app unpacks to a new folder. `source/package.json` uses Electron 44.7.0 and electron-builder ^26.0.12 for a Windows x64 portable build.

**Serve on Wi-Fi:** on request from the start menu, `main.cjs` starts an HTTP server on port 4173 on all IPv4 interfaces. It answers GET and HEAD for the listed game files only and stops when switched off or when the app closes. `preload.cjs` gives the window only `status`, `start` and `stop`. `wifi.js` shows the controls only when that bridge exists, so guests in a browser never see them. Each guest plays alone with their own scores.

## Commands

```sh
cd source
npm install
npm run dev:web    # static server on http://127.0.0.1:4173/
npm start          # Electron
npm run dist       # Windows portable build
python3 -m unittest discover -s tests -p 'test_*.py'   # server tests
```

## Verification

- **2026-11-21:** 11 server tests passed. Headless Chromium passed 18 checks against the built web release with mock scores (desktop, phone in both orientations, tablet, and a static-server fallback). Against the live site, the pages, redirects, score API, MP3 sound, compression and headers were checked, the server files were confirmed unreachable, and the game loaded at desktop and phone size.
- **Not verified:** a real phone, the Electron app with the current source, a Windows build, Serve on Wi-Fi with a second device.

## Earlier findings (audit of 2026-10-26)

- **Ogg sounds missing from the Electron allowlist:** fixed in source by the Wi-Fi change of 2026-10-26; not yet tested in a packaged build.
- **Icon missing:** `source/package.json` refers to `build/icon.png`. The file exists locally, but the root `.gitignore` rule `build/` keeps it out of Git, so a clean checkout lacks it.
- **`recovered-source/*.as`:** mentioned in `source/README.md` and comments but not in the repository. That is missing evidence, not proof that the files never existed.
- **`source/source-manifest.json`:** hashes for six v1.42 files. On 2026-11-21 none of them matched, not even in the 2026-10-26 import, so the imported source had already changed since v1.42. The manifest describes v1.42, not the current files.
- **Tests:** none at import; server tests were added on 2026-11-21.
