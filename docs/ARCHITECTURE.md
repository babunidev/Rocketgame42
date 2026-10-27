# Technical Architecture — Audited 2026-10-26

**Status:** Source-based review only; no local runtime or test suite executed.

## Stack

Vanilla browser HTML, JavaScript, CSS, and SVG; Node/npm used for Electron-based Windows packaging. `package.json` declares Electron **44.7.0** and electron-builder **^26.0.12**. The Windows portable target is x64.

## Modules

| File | Responsibility |
| --- | --- |
| `source/game/assets.js` | Embedded recovered vector artwork / asset definitions |
| `source/game/gameplay.js` | Translated Flash-style mechanics, score, enemies, pickups, player |
| `source/game/runtime.js` | DOM/SVG scene graph, compatibility model, simulation clock |
| `source/game/missiles.js` | Seeker missile inventory, targeting, trajectories and hits |
| `source/game/highscores.js` + CSS | Menu, score entry, leaderboard, local persistence |
| `source/game/sfx.js` | Local OGG sound playback |
| `source/game/index.html` | HTML shell, SVG stage, instructions and menu |
| `source/main.cjs` | Electron window, custom protocol, offline restrictions and portable data path |
| `source/source-manifest.json` | SHA-256 integrity references for selected v1.42 game files |

The browser runtime describes itself as a reconstruction that does not embed a SWF interpreter. It uses a 48 Hz logic step and preserves specific legacy ActionScript behavior. The Electron shell uses a restricted `raketenspiel://` protocol, blocked external HTTP(S) requests, context isolation, sandboxing, and disabled Node integration.

## Local commands (documented, not executed here)

```sh
cd source
npm install
npm run dev:web    # Python static server on port 4173
npm start          # Electron
npm run dist       # Windows portable packaging
```

## Known gaps and audit findings

- `source/package.json` references `build/icon.png`, but that file was absent from the 33-file initial commit listing. Packaging/icon behavior needs checking.
- The Electron protocol allowlist includes HTML/JS/CSS but not `sounds/*.ogg`, despite `sfx.js` loading `sounds/...`. **Potential packaged-audio failure**; verify before claiming functional sound in the portable build.
- The `source/README.md` mentions `recovered-source/*.as`, but no such directory appears in the committed inventory. This is missing historical source/evidence, not proof it never existed.
- There is no committed automated test suite identified in the initial file list. Test hooks appear in the runtime and high-score code; that alone is not a recorded passing regression test.
- `source/source-manifest.json` lists a subset of game files, not every committed JS file; do not treat it as a complete inventory.
- Ordinary Git excludes `node_modules`, `.tools`, generated Electron data, and packaged executables.

## Verification

2026-10-26: Inspected named files via GitHub connector and checked repository import listing supplied by Babuni.dev. Browser execution, game simulation, builds, and cross-platform behavior **not verified**.


## Local Wi-Fi serving (2026-10-26 source addition)

`main.cjs` now includes a Node HTTP server that binds to all IPv4 network interfaces on port 4173 only when requested from the desktop menu. It allows only enumerated game assets and supports GET/HEAD; it stops when disabled or the app exits. `preload.cjs` exposes three IPC actions to the trusted Electron main frame. `game/wifi.js` and menu controls show hosting status and LAN URLs only when the preload API exists. Browser visitors have no host controls or Node access.

**Limits:** This is not multiplayer; each player retains a separate local leaderboard. Firewall rules and network isolation may prevent access. Port conflicts are shown as errors. Binding to all interfaces should be used only on trusted LANs. Runtime tests and rebuild are pending. The previously noted OGG routing gap was addressed in source, not yet verified in a packaged build.

## Audit clarification — 2026-10-27

The earlier imported-source finding that the custom Electron protocol did not allow OGG files is **historical**: the 2026-10-26 Wi-Fi source change expanded the relevant allowlist. Its successful operation in a packaged build has not been independently demonstrated. The LAN HTTP host is separate from the `raketenspiel://` local Electron protocol: the former serves a fixed allowlist over `http://<LAN IPv4>:4173/` on explicit request, while the latter loads the desktop window itself. `preload.cjs` exposes only `status`, `start`, and `stop`; `game/wifi.js` does not reveal host controls unless that Electron bridge is present. These source-level boundaries do not replace real firewall, second-device, audio and release-build tests.
