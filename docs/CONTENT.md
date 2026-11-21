# Content

What material the repository holds, where it came from, and what may be published. Rights are explained in [asset rights](ASSET_RIGHTS.md).

## Game material

- `source/game/assets.js`: all game artwork as embedded vector data, recovered from the earlier version. There are no separate image files.
- `source/game/sounds/`: the rocket and seeker explosion sounds (Ogg). The web release adds MP3 copies at build time. Copies of the Ogg files also sit in the repository root (`RoketExplosion.ogg`, `seekerExplosion.ogg`).
- `source/game/index.html`, `highscores.css`, `touch.css`: the page shell, the start and score screens and the touch controls.

## Logo and QR code

- `assets/branding/raketenspiel-42-logo-v1.png`: the first logo, transparent, 1774 × 887. AI-generated; approved direction.
- `assets/branding/rocket-game-42-logo-square-v1.png`: the square English logo, transparent, 1254 × 1254, made from the first one.
- `assets/branding/rocket-game-42-logo-square-627.webp`: a 627 × 627 WebP of the square logo.
- [assets/branding/README.md](../assets/branding/README.md) records the full prompts and checks. Neither logo is used inside the game yet.
- `assets/qr/`: a QR code (SVG, PNG) that opens the game's play module on babuni.dev. See [its README](../assets/qr/README.md).

## Historical material

- `RaketenspielOLD/`: the Flash versions `raketenspiel.swf`, `raketenspiel3.swf`, `raketenspiel4.swf`, `raketenspiel41.swf` and `raketenspiel42.swf` with their HTML launchers (one more launcher, `raketenspiel2.html`, has no SWF), a Flash helper script and an older ZIP archive.
- `raketenspiel.html`: a Flash launcher with a 550 × 400 game area.
- `Raketenspiel 42 v1.42 Read Me.txt`: the instructions for the portable Windows x64 release v1.42. The EXE and RAR themselves are kept out of Git.

## Gaps

Not found in the repository: the original `.fla` files, dated development notes, release notes for the Flash versions, screenshots or recordings, the art production files, the `recovered-source/*.as` files mentioned in comments, and a full rights inventory.

## Publishing

The game is published at [babuni.dev/Rocketgame42](https://babuni.dev/Rocketgame42/), built from `source/game/` only. Don't distribute the historical binaries or media until their rights and origin are clear. Don't present the archive as a complete version history without dated evidence.
