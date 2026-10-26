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
