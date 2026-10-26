# Game Design — Observed Implementation

**Source status:** Describes the committed v1.42 source and UI; gameplay has not been interactively verified by this audit.

## Core loop

Steer a defending ship in a 550 × 400 playfield, shoot incoming threats, prevent damage to the mothership, manage life/laser energy, survive increasing difficulty, and compete for a locally saved score.

## Controls

- Mouse movement: steer.
- Hold left mouse button: fire laser.
- Right mouse button: launch earned seeker missiles.
- End of run: enter a name and press Enter to store the result.

These controls are stated in `source/game/index.html` and the v1.42 readme.

## Special asteroids

Blue contact increases life (code clamps to 10,000); green increases power/laser energy (clamped to 10,000); red contact reduces life. Green and blue pickups increase internal points by 150 (displayed as +15). The code also supports shooting the red type and awards points for destroying threats.

## Seeker missiles

`source/game/missiles.js` awards one seeker pod per 20 displayed score, up to 24 docked simultaneously; right-click launches the current pods. Targets can be retargeted mid-flight, and splash effects can destroy nearby asteroids. Movement uses curved Bézier paths; flight tuning scales with level.

## Timing and difficulty

`gameplay.js` identifies the original rate as 16 FPS and the current logic rate as 48 Hz, using a 16/48 scaling factor to maintain real-time rates. `runtime.js` also uses a 48 Hz visual step. Some enemy behavior and descent rates depend on level. Preserve empirical verification as a separate task.

## High scores

`highscores.js` stores scores in browser localStorage under `raketenspiel.highscores.v1`, sorts by points/level/time, and displays the top ten. It handles unavailable storage with an in-memory session fallback. Electron configures portable-style application data storage.

## Unverified details

Balance, actual difficulty curve, keyboard/controller accessibility, mobile playability, historical parity with each original SWF, and browser/Windows packaging success remain untested in this audit.
