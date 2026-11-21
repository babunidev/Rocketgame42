# Decision record

What was decided for Rocket Game 42, by whom and why, and what is still open. Each entry keeps apart **my direction** as the creative, **AI proposals**, what was **implemented** and what was **verified**. Decisions found only in the imported code (D-003 to D-005) say so, because who made them and why is not recorded.

## D-001 — A documented repository

- **2026-10-26, my direction:** a structured repository for developing and documenting the game.
- **Implemented:** an AI assistant (tool and model not recorded) wrote the documentation scaffold, and I committed it.

## D-002 — Preserve the existing material

- **2026-10-26, my action:** import the reconstructed source, the older Flash versions, the sounds and the v1.42 readme as commit `4d50ce6`. Leave out generated app data, dependencies and the packaged EXE and RAR.
- **Limit:** the import does not date the imported files.

## D-003 — Rebuild the Flash game in SVG and JavaScript

- **Found in the source:** `source/README.md` calls the game a recovered HTML/JS/SVG version, not the original `.fla`.
- **Status:** implemented before the import. Who decided it, when and why is not recorded.

## D-004 — Keep the original pace at a higher simulation rate

- **Found in the source:** `gameplay.js` and `runtime.js` convert the 16 FPS Flash behaviour to 48 Hz logic with scaled rates, so that real-time behaviour stays the same.
- **Status:** implemented; fidelity to the Flash original not measured.

## D-005 — An offline portable Windows app

- **Found in the source and readme:** Electron packaging, a fixed custom origin so portable score data persists, and blocked external requests.
- **Status:** configured; the packaged app has not been run since the import.

## D-006 — Wi-Fi hosting on demand

- **2026-10-26, my direction:** a **Serve on Wi-Fi** button, so the desktop app can be shared with people on the same network without typing server commands. A convenient local demo, separate from hosting the game publicly.
- **AI implementation choice** (tool and model not recorded): an HTTP listener in the Electron main process; only status, start and stop exposed to the window through `preload.cjs`; no host controls in ordinary browsers; port 4173 on all IPv4 interfaces; only listed files served.
- **Status:** implemented in `source/main.cjs`, `source/preload.cjs` and `source/game/wifi.js`. Not tested on a real LAN, and not in a packaged build.
- **Boundary:** it shares a playable page, not a shared game, scoreboard or co-op session.

## D-007 — History from evidence only

- **2026-10-27, my direction:** continue my documentation audits with #29 and improve the project history without changing the game.
- **AI approach** (tool and model not recorded): treat the Flash archive, the reconstruction and the Wi-Fi extension as separately evidenced stages, and leave unknown dates and motives unknown rather than filling them in.
- **Status:** documentation only.

## D-008 — A logo drawn from the game

- **2026-10-29, my direction:** a cool, flashy, stylish logo based on the game's existing designs.
- **AI proposal** (tool and model not recorded): keep the Raketenspiel 42 title and the game's blue-silver, orange, navy and lime; add metallic slanted lettering and an exhaust arc.
- **Decision:** the visual direction is approved; I confirmed it the same day. The file is `assets/branding/raketenspiel-42-logo-v1.png`, with its prompt.

## D-009 — An English square logo

- **2026-10-29, my direction:** a square version titled Rocket Game, because the game is now in English. The 42 stays.
- **Implemented:** `assets/branding/rocket-game-42-logo-square-v1.png`; the first logo is kept.
- **Open:** where the logo appears in the game. The request does not mean all game text has been translated or renamed.

## D-010 — License

- **2026-11-13, my decision:** MIT for the original reconstructed game code. Sound, artwork, the game's identity and the historical Flash material stay under separate terms (see [asset rights](ASSET_RIGHTS.md)). It covers only what I have the right to license; third-party material keeps its own credits and terms.
- **Implemented:** AI assistance (tool and model not recorded) added the license and updated the documentation. No program change.

## D-011 — Web release with a global high-score list and touch controls

- **2026-11-21, my direction:** make the game playable from my website, with a database-backed high-score list shown on the welcome and game-over screens like an arcade, and playable on every device with simple mobile controls for steering, laser and rockets.
- **AI proposal, implemented** (Claude Code, Claude Opus 5.5): reuse the Button Game server pattern (Python standard library and SQLite, systemd, an nginx snippet, releases by the `babunideploy` account) instead of a new Node service or a PostgreSQL database for one score table. Path `/Rocketgame42/`, port 8788, best 100 kept and top 10 shown, in the same order as the local list (points, then level, then the earlier run). Offline builds keep the local list.
- **AI proposal, implemented:** in landscape, a steering pad on the left and hold-LASER and tap-ROCKETS buttons on the right; in portrait, a control bar under the game and a hint to turn the phone. Touching the playfield steers but does not fire.
- **Decision:** after my approval of these choices, the release went live as `c7c3c22`. Like Button Game, scores are trusted from the browser; obvious fakes can be deleted on the server.
- **Open:** the control layout after I try it on a real phone.

## D-012 — A website play module with a shareable QR code

- **2026-11-21, my direction:** the game gets its own module on the Rocket Game 42 project on my website, with the play button, and a QR code I can share that brings people to that module.
- **Implemented** (Claude Code, Claude Opus 5.5): the `play-live` module in the babuni.dev repository, modelled on Button Game's, and a QR code for the deep link `https://www.babuni.dev/#project=rocket-game-42&read=play-live`. Unlike Button Game's QR, it opens the module rather than the game. Published to the website on 2026-11-21.

## Open questions

- What does "42" mean, and when were the Flash versions made?
- How did the mechanics change across the Flash versions, and why did I revive the game?
- Which parts of the reconstruction were my requests and which were AI-assisted?
- Distribution rights for the historical material, and acceptance criteria for a new Windows release.
- Where the logo appears in the game.
