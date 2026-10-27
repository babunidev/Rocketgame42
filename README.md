# Raketenspiel 42 — Rocket Game 42

**Author:** Babuni.dev

An arcade defence game with roots in an older Flash project, reconstructed as a browser-playable HTML/JavaScript/SVG game and packaged in Electron for Windows. **The project has existing working-source material; runtime operation has not been independently tested in this documentation audit.**

The player defends a mothership, steering with the mouse, firing a laser, and launching accumulated seeker missiles. Colored asteroids introduce risk and replenishment; local high scores retain runs.

## Repository guide

- [CONCEPT.md](CONCEPT.md) — recovered creative concept and confirmed experience
- [ROADMAP.md](ROADMAP.md) — preservation, verification, and portfolio work
- [CHANGELOG.md](CHANGELOG.md) — evidence-based changes, not an invented release history
- [AGENTS.md](AGENTS.md) — collaborator instructions
- [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) — implemented game mechanics
- [docs/DESIGN.md](docs/DESIGN.md) — presentation, controls, accessibility
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — systems, packaging, verification
- [docs/CONTENT.md](docs/CONTENT.md) — source/assets/legacy inventory
- [docs/DEVLOG.md](docs/DEVLOG.md) — narrative development history and retrospective reconstruction
- [docs/DECISIONS.md](docs/DECISIONS.md) — evidence and unresolved decisions
- [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) — attribution method
- [source/README.md](source/README.md) — developer run/build instructions

## Development source

`source/game/` holds game logic, the SVG scene runtime, embedded vector assets, missiles, sound, and high scores. `source/main.cjs` provides the Electron shell. `RaketenspielOLD/` holds legacy Flash/HTML material. The original editable Flash authoring file is not present in the committed inventory; the developer README identifies the modern version as a reconstruction, not the original .fla.

Run the browser version (requires Python 3):
```sh
cd source
npm run dev:web
```
Then open http://127.0.0.1:4173/ . This command is documented in source/package.json but was **not executed in the 2026-10-26 audit**. Electron launch: `cd source && npm install && npm start`. Windows packaging: `npm run dist`.

## Provenance and status

The first documented repository import on **2026-10-26** added 33 source, asset, and legacy files in commit [4d50ce6](https://github.com/babunidev/Rocketgame42/commit/4d50ce6). This is the **repository-import date, not the original creation date**. The portable v1.42 readme describes a Windows x64 offline build; its EXE and RAR are deliberately excluded from Git tracking. They are not published by this repository.

Some source references and code comments attest to earlier work, but a complete dated historical changelog was not found in the committed files. See the provenance notes in the [development journal](docs/DEVLOG.md).

## Documentation audit #29 — 27 October 2026

The repository includes a **Serve on Wi-Fi** feature in the Electron source, introduced after the imported v1.42 snapshot. A desktop-only control starts and stops an HTTP server on port 4173, displays available LAN IPv4 addresses, and allows other devices to load an independent browser game. This is **LAN access, not synchronized multiplayer**: scores and sessions are not shared. The shipped historical portable executable is not evidence that this newer source feature is included; a new build and real LAN verification remain outstanding.

The GitHub documents distinguish the preserved Flash artifacts, modern reconstruction, October 2026 Wi-Fi extension, and portfolio possibilities. In particular, 2009 file metadata is not a verified original release date, and successful browser, Electron, Windows packaging, audio, LAN, and public-hosting tests are not claimed. See [architecture](docs/ARCHITECTURE.md), [decision history](docs/DECISIONS.md) and [development journal](docs/DEVLOG.md).
