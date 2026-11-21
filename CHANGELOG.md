# Changelog

What changed in this repository, newest first. The story behind each change is in the [development journal](docs/DEVLOG.md), and the decisions are in the [decision record](docs/DECISIONS.md). Where AI did the work, the entry names the tool and model, or says that they were not recorded.

The repository starts with an import on 26 October 2026. Older history comes only from the preserved files and is described in the journal, not here.

## 2026-11-21 — documentation review

- Revised all project documentation against `docs/DOCUMENTATION.md`. Babuni is named as the creative (babuni.dev is the website), the journal and decisions are in first person, outdated status claims are corrected, and this changelog is in date order. `docs/AI_COLLABORATION.md`, `docs/DOCUMENTATION.md` and `AGENTS.md` are unchanged. Claude Code (Claude Opus 5.5).
- Recorded that `source/source-manifest.json` matches none of its six files, not even in the 2026-10-26 import.

## 2026-11-21 — website play module and QR code

- Added `assets/qr/`: a QR code (SVG and PNG) for `https://www.babuni.dev/#project=rocket-game-42&read=play-live`, the babuni.dev module with the Play button. The module itself is in the babuni.dev repository and was published to the website the same day. Claude Code (Claude Opus 5.5).

## 2026-11-21 — web release with global high scores and touch controls

### Added
- `source/server/`: a Python standard-library game server with a SQLite top-100 high-score list (`GET`/`POST api/scores`), a systemd unit, an nginx snippet for `https://babuni.dev/Rocketgame42/`, a one-time server setup script, and build and publish scripts that follow the Button Game deployment. Claude Code (Claude Opus 5.5).
- On-screen touch controls (`touch.js`, `touch.css`): a steering pad, hold-to-fire **LASER** and tap **ROCKETS**. Touching the playfield steers without firing. Claude Code (Claude Opus 5.5).
- Server tests in `source/tests/test_public_server.py`. Claude Code (Claude Opus 5.5).

### Changed
- `highscores.js` shows the global list on the welcome and game-over screens when the score server answers. Otherwise it keeps the local browser list (Electron, Serve on Wi-Fi, static server). Claude Code (Claude Opus 5.5).
- `runtime.js`: touch on the playfield only steers, and `steer()` and `fireMissiles()` are exposed for the touch controls. Mouse controls are unchanged. Claude Code (Claude Opus 5.5).
- `sfx.js` falls back to MP3 copies, made by `build-web.sh`, where Ogg cannot play. The Electron file allowlist in `main.cjs` includes the two new files. Claude Code (Claude Opus 5.5).

### Fixed
- `build-web.sh` no longer copies `source/build/icon.png`, which Git ignores; this had stopped the first publish from a clean checkout. Claude Code (Claude Opus 5.5).

### Released
- Release `c7c3c22` deployed to `https://babuni.dev/Rocketgame42/` (service `rocketgame42` on 127.0.0.1:8788, included in the babuni.dev nginx site).

## 2026-11-19 — records committed and documentation moved

- Committed the logo work of 29 October (wide logo, square English logo, a 627 × 627 WebP of the square logo) with its journal, decision, design, concept, content and changelog entries. They had been written earlier but never committed. Claude Code (Claude Opus 5.5).
- Moved `CONCEPT.md`, `ROADMAP.md` and `ASSET_RIGHTS.md` into `docs/`. The root keeps only `README.md`, `AGENTS.md`, `LICENSE` and `CHANGELOG.md`, and links and the layout rule in `AGENTS.md` were updated. Claude Code (Claude Opus 5.5).
- Replaced `docs/AI_COLLABORATION.md` with the shared text used in all of Babuni's repositories, and added the rule that it takes no dated entries to `AGENTS.md` and `docs/DOCUMENTATION.md`. Claude Code (Claude Opus 5.5).

## 2026-11-18 — collaboration record revised

- Revised `docs/AI_COLLABORATION.md` for first-person voice and checked its attribution. Codex (GPT-6).

## 2026-11-13 — license

- Adopted the MIT license for the original reconstructed software (`LICENSE`), and added `ASSET_RIGHTS.md` to separate the game identity, artwork, sound and historical Flash material from it. AI tool and model not recorded.

## 2026-11-03 to 2026-11-10 — documentation standard

- Added `docs/DOCUMENTATION.md` and aligned `AGENTS.md` with it: first-person voice, attribution of AI work, evidence levels. The records do not say who drafted these or with which tool.

## 2026-10-29 — logo

- Added `assets/branding/raketenspiel-42-logo-v1.png`, a transparent 1774 × 887 logo, with its generation prompt. AI image generation; tool and model not recorded.
- Added `assets/branding/rocket-game-42-logo-square-v1.png`, a square English Rocket Game 42 variant, with its prompt. The first logo is kept.
- Both were checked visually for spelling and composition, and their size and RGBA format were confirmed. No game code changed.

## 2026-10-27 — documentation audit #29

- Updated the overview, roadmap, architecture, decisions, journal and collaboration record to describe Serve on Wi-Fi and to keep the Flash archive, the reconstruction and the Wi-Fi extension apart. No program files changed. AI tool and model not recorded.

## 2026-10-26 — import, documentation and Serve on Wi-Fi

### Added
- Initial documentation files.
- Commit `4d50ce6`: 33 files with the reconstructed source, sounds, the Flash archive and the v1.42 readme. Dependencies, generated app data and the packaged EXE/RAR are excluded.
- **Serve on Wi-Fi** (Electron only): a start-menu button and panel that start and stop an HTTP server on port 4173 for the listed game files, show the LAN addresses, and stop when the app closes. Implemented in `main.cjs`, `preload.cjs`, `game/wifi.js`, `index.html` and `highscores.css`. The Electron protocol allowlist now includes the Ogg sounds. Not tested on a LAN; the existing EXE does not include it. AI tool and model not recorded.

### Changed
- The documentation describes the imported game from its source code and credits Babuni as author. AI tool and model not recorded.

## Present at import (dates unknown)

The 2026-10-26 import already contained the following. The repository does not show when each was added.

- The JavaScript/SVG reconstruction of the Flash gameplay with embedded vector art.
- 48 Hz logic converted from the original 16 FPS.
- Laser, enemies and asteroids, coloured special asteroids, seeker missiles and sound.
- Local high-score entry and board.
- Electron configuration for a portable Windows x64 build.
