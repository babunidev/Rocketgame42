# Rocket Game 42 (Raketenspiel 42)

**Creative:** Babuni · **Play:** [babuni.dev/Rocketgame42](https://babuni.dev/Rocketgame42/)

Rocket Game 42 is a small arcade defence game. You steer a ship along the bottom of the screen and protect the mothership from rockets, asteroids and an enemy craft. Your weapons are a laser and a stock of seeker missiles that grows with your score. Coloured asteroids can repair your shield, refill the laser or cause damage. At the end of a run you put your name on the high-score board.

The game began as a Flash game. Its versions are preserved in numbered files up to 42, but their dates are unknown. The current version is a reconstruction in HTML, JavaScript and SVG that runs in any browser, without Flash.

## Play

- **On the web:** [babuni.dev/Rocketgame42](https://babuni.dev/Rocketgame42/). It has one global high-score list, the best 100 runs with the top 10 shown, and on-screen controls on phones and tablets. The [Play Rocket Game 42 module](https://www.babuni.dev/#project=rocket-game-42&read=play-live) on my website has the play button and a [shareable QR code](assets/qr/README.md).
- **Controls:** with a mouse, move to steer, hold the left button for the laser and right-click to launch the seeker missiles. On a touch screen, drag the steering pad (or touch the playfield) to steer, hold **LASER** and tap **ROCKETS**.
- **Offline:** the Electron desktop app and its **Serve on Wi-Fi** option keep high scores in each browser. See [source/README.md](source/README.md).

## Status

Live on babuni.dev since 21 November 2026, with release `c7c3c22`. Automated server tests, headless-browser checks and checks of the live site have passed. Still untested: play on a real phone (including iPhone sound), the Electron app and a Windows build of the current source, and Serve on Wi-Fi with a second device. The [roadmap](docs/ROADMAP.md) lists what comes next.

## Repository guide

| Read | For |
| --- | --- |
| [docs/CONCEPT.md](docs/CONCEPT.md) | The game's idea and what is known about its history |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | Rules, controls, special asteroids, missiles and high scores |
| [docs/DESIGN.md](docs/DESIGN.md) | Look, controls on each device, logo, accessibility |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the code, desktop app and web server fit together |
| [docs/CONTENT.md](docs/CONTENT.md) | What files the repository holds, including the Flash archive |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What is done, what is next, what is open |
| [docs/DEVLOG.md](docs/DEVLOG.md) | The development story in my words |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decisions, alternatives and open questions |
| [CHANGELOG.md](CHANGELOG.md) | What changed, by date |
| [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) | How I work with AI here |
| [source/README.md](source/README.md) | Running, editing and building the game |
| [source/server/README.md](source/server/README.md) | The web server, score database and deployment |
| [AGENTS.md](AGENTS.md), [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) | Rules for contributors and AI agents |

## Where the files are

`source/game/` holds the game. `source/main.cjs` is the Electron desktop shell, and `source/server/` holds the web server. `RaketenspielOLD/` and `raketenspiel.html` preserve the Flash versions, and `assets/` holds the logo and QR code. The original Flash project file (`.fla`) is not in the repository. The portable v1.42 Windows build is described in `Raketenspiel 42 v1.42 Read Me.txt`, but its EXE and RAR are not tracked or published here.

## License

The reconstructed game code is [MIT licensed](LICENSE). The game's identity, artwork, sound and the historical Flash material are not covered by MIT; see [asset rights](docs/ASSET_RIGHTS.md).
