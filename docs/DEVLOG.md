# Development journal

The story of Rocket Game 42, told in my words. Entries from 26 October 2026 onward come from that day's work. The first three sections are a **retrospective reconstruction**: they read the preserved files without inventing dates, motives or authorship. Where AI did the work, the entry names the tool and model, or says that they were not recorded.

## Retrospective — a Flash game in numbered versions (dates unknown)

`RaketenspielOLD/` keeps Flash SWFs and their HTML launchers, with names ending in 3, 4, 41 and 42. The separate `raketenspiel.html` uses old Flash embedding and a 550 × 400 game area. These files show that the game existed in several versions before this repository. They don't show what changed between versions or when. A local file listing once showed a February 2009 timestamp on `raketenspiel.html`; that is a clue from file metadata, not proof of a release date. The meaning of the title, my reasons for each version and the order of the changes still need my own account.

## Retrospective — rebuilding the game without Flash (dates unknown)

According to `source/README.md`, the browser version was recovered from the v1.42 portable Electron executable. It was rebuilt in HTML, JavaScript and SVG and is not the original `.fla`. The code fits that description: `assets.js` holds the vector art, `runtime.js` is a small scene graph imitating Flash clips, and `gameplay.js` calls itself a faithful translation of the ActionScript.

One thread survives in the comments. The Flash game ran its logic at 16 frames per second; the remake runs at 48 Hz and scales movement, chance and timing so that the smoother simulation doesn't play three times as fast. Without earlier revisions, the discussion behind this can't be recovered, and parity with the original hasn't been measured.

The imported version also has a laser, coloured asteroids with different effects, a stock of blue seeker missiles that grows with the score, local high scores, an instruction menu and sound. **When each was added, and by whom, cannot be established from the snapshot.**

## Retrospective — the portable v1.42 build (date unknown)

The v1.42 readme describes a self-contained 64-bit Windows build that needs no installation or network and stores scores beside the executable when it can. It also warns about unsigned-publisher messages. `source/main.cjs` keeps a fixed custom origin so scores survive when the portable app unpacks to a different folder. `source/package.json` defines the portable build. Neither the executable nor a rebuild has been run since the import.

## 2026-10-26 — a repository for the game

To give the game a lasting home, I created `babunidev/Rocketgame42`, connected my local folder, set up Git and pushed the existing files as commit `4d50ce6`: 33 files of source, sounds, the Flash archive and the v1.42 readme. Dependencies, generated app data and the packaged EXE and RAR stayed out.

An AI assistant (tool and model not recorded) had first written a generic documentation scaffold, because the repository was still empty, and then guided me through the import. Its first documents said no game existed yet. That was true of the empty repository but wrong once the code arrived.

## 2026-10-26 — reading the recovered code as history

Next I asked for the imported code to be reviewed and for any old devlogs or changelogs to be found, so the material could later serve my portfolio. The AI assistant read the source README, package file, gameplay, runtime, missiles, high scores, page shell, sound helper, Electron launcher and the old HTML. It found no historical devlog or changelog. The best evidence was the numbered SWFs, the v1.42 readme, the code comments and the recovery note. It replaced the "not yet implemented" documents with descriptions of the existing game, labelled by evidence.

It also noted three things to check, not confirmed bugs. The Electron file allowlist seemed to leave out the Ogg sounds. The build referred to an icon missing from the import. And comments mention `recovered-source/*.as` files that are not in the repository. Nothing was run in this review.

## 2026-10-26 — a button for playing together on Wi-Fi

At gatherings I wanted to share the game with friends on the same network without typing server commands, so I asked for a **Serve on Wi-Fi** button in the desktop app. Public web hosting and phone controls were separate wishes for later.

A browser page cannot open a server itself, so the AI assistant (tool and model not recorded) put a small HTTP server in the Electron main process. It gave the game window only start, stop and status through the preload bridge. The button opens a panel with the local addresses and the sharing switch, and guests see no host controls. The server listens on TCP 4173 on all IPv4 interfaces and serves only listed game files, so it belongs on trusted networks. Each guest plays alone with their own scores; it is not multiplayer. The change was committed directly but has not been tested on a LAN, and the old EXE doesn't include it.

## 2026-10-27 — documentation audit #29

In my series of documentation audits across repositories, this one brought the Wi-Fi feature into the records and separated the three generations of the game: the Flash archive, the browser reconstruction and the Wi-Fi extension. The AI assistant (tool and model not recorded) examined `main.cjs`, `preload.cjs`, `wifi.js` and the earlier records. It kept the 2009 timestamp as a clue rather than a release date, and kept the old v1.42 executable apart from the newer, unbuilt source. Only documentation changed. Browser and Windows play, sound, LAN access and fidelity to the Flash game stayed untested.

## 2026-10-29 — a logo from the game's own look

What I asked for was a cool, flashy, stylish logo based on the game's existing designs. The AI assistant (tool and model not recorded) studied the start menu, the rocket artwork and the interface colours. With an image generator it produced a proposal: silver-blue slanted lettering, a lime "42", and the blue-silver rocket with an orange exhaust arc. The direction was right. Because the game now speaks English, I asked for a square version titled **Rocket Game**. That version stacks ROCKET and GAME above the lime 42 and keeps the rocket and its arc. Both files and their prompts are in [assets/branding](../assets/branding/README.md). Spelling, composition, size and transparency were checked by eye and by file inspection. Where the logo goes in the game is still open.

## 2026-11-03 to 2026-11-13 — writing rules and a license

These weeks set the ground rules for the records: the shared documentation standard in `docs/DOCUMENTATION.md` (3 to 10 November), and then the license. Public source alone didn't tell anyone what they could reuse, so on 13 November I chose MIT for the reconstructed game code and kept the artwork, sound, game identity and historical Flash files under separate terms. AI assistance (tool and model not recorded) added the license and brought the notes into line. Who drafted the documentation standard, and with which tool, is not recorded.

## 2026-11-18 to 2026-11-19 — tidying the records

At my request, Codex (GPT-6) revised the collaboration record for first-person voice on 18 November. The next day Claude Code (Claude Opus 5.5) moved the documents other than README, AGENTS, LICENSE and CHANGELOG into `docs/`. It committed the logo files and their records, which had been written but never committed. And it replaced the collaboration record with the short text I now use in all my repositories.

## 2026-11-21 — on the website, and on phones

Next I wanted the game playable straight from my website, with a shared high-score list like an arcade cabinet, and playable on every device. Phones needed simple controls for the three things a pilot does: move, fire the laser and launch the rockets. The high scores had to show on the welcome screen and on the game-over screen. For how the server is reached, I pointed to my other projects.

Claude Code (Claude Opus 5.5) studied this repository, the babuni.dev deployment notes and Button Game, which already runs at `babuni.dev/Buttongame/` on the same server with a shared score list. It proposed the same pattern and built it: a small Python server with a SQLite top-100 list behind the existing nginx site at `/Rocketgame42/`, with its own service account, port 8788 and release folder, plus setup and publish scripts. The score screens use the global list when the server answers and the local list everywhere else. On touch screens, a steering pad sits on the left, and a hold-to-fire LASER button and a tap ROCKETS button sit on the right, or below the game in portrait. The playfield itself also steers. MP3 copies of the sounds were added for iPhones. On the server it only looked: paths, ports and nginx includes, over my administrator login.

Its tests: 11 server tests passed, and a headless Chromium run against the built release with **mock** scores passed 18 checks on desktop, phone (both orientations) and tablet. The checks covered the global list on both screens, saving and ranking a score, steering while holding the laser, launching rockets, steering on the playfield without firing, falling back to local scores on a plain static server, and no page errors. It opened the game-over screen with a simulated event, not a played-out run.

Then I deployed. After I ran the server preparation, the first publish stopped: the build copied an icon that Git ignores. Claude Code removed that unneeded copy and confirmed the build from a clean checkout. Once I had published release `c7c3c22` and switched it on, the setup script reported the service healthy, `nginx -t` successful, and the game, Button Game and the website answering. From outside, Claude Code then confirmed the pages, redirects, the empty score list, MP3 sound, compression and headers. It found the server files unreachable and the other sites unaffected, and the live game loaded with the global list at desktop and phone size. No test score was posted, so the public board started empty.

## 2026-11-21 — a QR code that leads to the play button

To bring people to the game, I wanted it on my website in its own module with the play button, and a QR code I can share that opens that module. Claude Code (Claude Opus 5.5) added the **Play Rocket Game 42** module to the babuni.dev site, modelled on the Button Game module. It made the QR code for the site's deep link to the module (`#project=rocket-game-42&read=play-live`). Unlike Button Game's code, which opens the game itself, this one opens the website first. The code was decoded back to the link, and the module was checked in headless Chrome at phone and desktop size, locally and after I pushed and published the website. Scanning it with a real phone is still to do.

## 2026-11-21 — the documentation, revised

With the new writing rules in place, I asked for one pass through all of this project's documentation. Claude Code (Claude Opus 5.5) checked every entry and rewrote where needed. It named me, Babuni, as the creative instead of the website name, and recast the journal and decisions in my voice. It gave each AI contribution its tool and model, or said they were not recorded. It also corrected status claims that the release had overtaken, put the changelog in date order and turned the README back into an entry point. While checking facts it found that the v1.42 hash manifest matches none of its files, not even at the import, so the imported source had already changed since v1.42.
