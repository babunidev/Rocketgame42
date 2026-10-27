# Decision Register

Separate explicit Babuni.dev decisions from inferred technical decisions in existing code.

## D-001 — Development documentation

- **2026-10-26; confirmed Babuni.dev request:** Establish a structured repository for game development. The assistant authored the scaffold. Implemented and committed.

## D-002 — Preserve existing project material

- **2026-10-26; confirmed Babuni.dev action:** Import local source, older Flash versions, sounds and the v1.42 readme to GitHub as commit `4d50ce6`. Ignore generated app data, dependencies, packaged EXE/RAR. Implemented.
- This does not establish the origin dates of the imported artifacts.

## D-003 — Reconstruct Flash content as browser SVG/JS

- **Evident in source, decision maker/reasons not independently documented:** `source/README.md` calls the remake a recovered HTML/JS/SVG version, not the original editable `.fla`.
- **Status:** Implemented in imported source; original decision chronology unresolved.

## D-004 — Maintain legacy rates at higher simulation frequency

- **Evident in source:** `gameplay.js` and `runtime.js` describe converting 16 FPS behavior to 48 Hz logic with rate scaling. Implemented in code, fidelity not tested here.
- **Rationale documented in comments:** retain original real-time behavior.

## D-005 — Offline portable Windows shell

- **Evident in source and readme:** Electron packaging, fixed custom origin for portable score data, constrained external requests. Implemented/configured; packaged runtime not verified.

## Open decisions / missing testimony

Meaning of “42”; original Flash creation chronology; which changes were Babuni.dev-requested versus AI-assisted in the remake; whether historical SWF differences are design milestones; distribution rights; test/build acceptance criteria; future portfolio demo presentation.

## D-006 — On-demand local Wi-Fi hosting

- **2026-10-26; Babuni.dev direction:** Provide an explicit **Serve on Wi-Fi** button so the desktop application can be shared with people on the same network without typing server commands. This was requested as a convenient local demonstration method, separately from eventual self-hosting.
- **AI implementation choice:** Put the HTTP listener in the Electron main process, expose only status/start/stop to the local window through `preload.cjs`, and omit host controls in ordinary browser sessions. The server uses port 4173, binds to IPv4 interfaces and serves only whitelisted files.
- **Result:** Implemented in source (`source/main.cjs`, `source/preload.cjs`, `source/game/wifi.js`), but not accepted through a recorded real-device LAN test or a freshly packaged release.
- **Boundary:** The feature shares a playable page, not a networked game state, scoreboard, or cooperative session. Those should not be inferred or described as approved additions.

## D-007 — Evidence-first project history (documentation audit, 2026-10-27)

- **User direction:** Continue the numbered repository documentation audit with #29, improving existing history without modifying the game.
- **AI contribution:** Consolidate the Flash archive, JS/SVG reconstruction and Wi-Fi extension into separately evidenced stages. Preserve unknown original dates and motivations rather than completing the history by speculation.
- **Status:** Documentation-only update. No game, packaging, or LAN validation in this audit.
