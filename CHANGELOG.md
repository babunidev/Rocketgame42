# Changelog

## 2026-11-21 — web release with global high scores and touch controls

- Added `source/server/`: a Python standard-library game server with a SQLite top-100 high-score list (`GET/POST api/scores`), a systemd unit, an nginx snippet for `https://babuni.dev/Rocketgame42/`, a one-time server setup script and build/publish scripts following the Button Game deployment. Claude Code (Claude Opus 5.5).
- `highscores.js` shows the global list on the welcome and game-over screens when the score server is reachable, and keeps the local browser list otherwise (Electron, Serve on Wi-Fi, static server). Claude Code (Claude Opus 5.5).
- Added on-screen touch controls (`touch.js`, `touch.css`): steering pad, hold-to-fire LASER, tap ROCKETS; touching the playfield steers without firing. Mouse controls unchanged. Claude Code (Claude Opus 5.5).
- `sfx.js` falls back to MP3 copies (built by `build-web.sh`) where Ogg cannot play. `main.cjs` allowlists the two new files. Claude Code (Claude Opus 5.5).
- Added server tests in `source/tests/test_public_server.py`.
- `build-web.sh` no longer copies the untracked `source/build/icon.png`, which broke the first publish from a clean checkout.
- Deployed release `c7c3c22` to `https://babuni.dev/Rocketgame42/` (service `rocketgame42` on 127.0.0.1:8788, nginx snippet in the babuni.dev site).

## 2026-11-19 — human–AI collaboration record

- Added a rule to `AGENTS.md` and `docs/DOCUMENTATION.md`: `docs/AI_COLLABORATION.md` takes no dated entries; contributions are recorded in the journal and changelog. Claude Code (Claude Opus 5.5).
- Rewrote `docs/AI_COLLABORATION.md` to the shared text used in all of Babuni's repositories: how Babuni works with AI, who did what (the tools and recorded models named in this project's records) and where the details are. The earlier, longer version stays in the Git history. Claude Code (Claude Opus 5.5).

## 2026-11-19 — documentation moved into `docs/`

- Moved `CONCEPT.md`, `ROADMAP.md` and `ASSET_RIGHTS.md` into `docs/`. The root keeps only `README.md`, `AGENTS.md`, `LICENSE` and `CHANGELOG.md`; links to the moved files and the documentation rules in `AGENTS.md` were updated. No code changed. Claude Code (Claude Opus 5.5).

## 2026-10-26 — Author attribution

- Identified **Babuni.dev** as author in the main README and documentation, and added the explicit author-naming rule to `AGENTS.md`.
- Kept historical source provenance and original development dates unchanged.

This file records changes supported by current repository evidence. The import is a snapshot, **not** a chronological commit-by-commit account of past development.

## 2026-10-29 — Logo proposal

- Added a transparent PNG logo proposal and its generation prompt in `assets/branding/` at the creator's request.
- Based on the rendered start menu and documented visual language; AI-authored treatment awaits creator acceptance. No runtime code changed.
- Visually checked text and composition; verified PNG dimensions of 1774 × 887 and RGBA format. No gameplay tests performed.

## 2026-10-26 — Documentation and source preservation

- Initialized development documents in the new GitHub repository.
- Imported 33 files containing modern source, audio, older Flash/HTML variants and release instructions in commit [4d50ce6](https://github.com/babunidev/Rocketgame42/commit/4d50ce6).
- Reviewed committed code and expanded the initial documentation with provenance and verification distinctions.
- Original historical development dates and detailed intermediate changelogs remain unverified.

## Existing functionality identified in the imported v1.42 snapshot (dates unknown)

- JavaScript/SVG reconstruction of Flash-style gameplay and embedded vector art.
- 48 Hz simulation conversion from nominal 16 FPS source logic.
- Laser combat, enemy/asteroid interaction, colored special asteroids, seeker missiles, sound integration.
- Local high-score entry, leaderboard UI and browser persistence.
- Electron offline Windows x64 portable packaging configuration.

These items existed at import; the repository does **not** prove when each was first added. No runtime verification is asserted.


## 2026-10-26 — Serve on Wi-Fi (source implementation, unverified)

- Added desktop-only **Serve on Wi-Fi** menu button with start/stop controls and LAN IPv4 URLs.
- Added an Electron preload bridge and main-process static HTTP server on port 4173, restricted to known game files.
- LAN server stops on application close; browser visitors do not receive server controls.
- Added playable asset and OGG routes to the Electron protocol allowlist.
- No runtime LAN test or packaged executable rebuild performed.

## 2026-10-27 — Documentation audit #29

- Clarified existing Electron-only **Serve on Wi-Fi** behavior in project overview, roadmap, architecture, decision register, development journal and collaboration record.
- Separated archived Flash versions, modern reconstructed source, and the subsequent October 2026 LAN extension without inferring missing original history.
- Recorded pending packaged build, sound and second-device LAN verification. No application source, binary, assets or tests changed during this audit.

## 2026-10-29 — Square English logo

- Creator approved the first logo style and requested English wording, Rocket Game.
- Added a square transparent Rocket Game 42 variant; preserved the original asset.
- Visually checked wording and composition; verified equal PNG width/height and RGBA format. No runtime changes or gameplay tests.

## 2026-11-13 — License and rights

- Established MIT for original game code, with legacy, art and audio assets separately treated and updated repository documentation to explain the permission boundary.
- Preserved third-party authorship and external assets' separate terms. No gameplay or runtime verification is claimed.
