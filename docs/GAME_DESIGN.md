# Game design

The rules as implemented in `source/game/`. They come from the imported reconstruction of the Flash game. The web release of 21 November 2026 added touch controls and a global high-score list without changing the gameplay. Balance and the difficulty curve have not been playtested and recorded.

## Core loop

Steer a ship along the bottom of a 550 × 400 playfield and shoot incoming rockets, asteroids and an enemy craft before they damage the mothership. Manage your shield and laser energy, survive as the levels speed up, and finish with a score for the high-score board. The level rises with the score.

## Controls

- **Steer:** move the mouse, or on a touch screen drag the steering pad or touch the playfield.
- **Laser:** hold the left mouse button, or hold **LASER**. Firing uses power, which slowly regenerates.
- **Seeker missiles:** right-click, or tap **ROCKETS**, to launch every pod in stock.
- **End of a run:** enter a name and press Enter or **SAVE SCORE**.

## Special asteroids

- **Blue:** let it hit the ship to raise the shield (life), capped at 10,000.
- **Green:** let it hit the ship to refill laser power, capped at 10,000.
- **Red:** damages the ship if it hits; shoot it down.

Blue and green pickups add 150 internal points, shown as +15. Destroying threats also scores.

## Seeker missiles

`missiles.js` adds one seeker pod for every 20 points of displayed score, with up to 24 docked beside the ship at once. One launch fires them all. They fly curved Bézier paths, retarget in flight, and can destroy nearby asteroids with their blast. Their speed and size scale with the level.

## Timing and difficulty

The Flash original ran at 16 FPS. `gameplay.js` and `runtime.js` run the logic at 48 Hz and scale rates by 16/48, so things happen at the original real-time pace. Some enemy behaviour and falling speeds depend on the level. How closely this matches the Flash versions has not been measured.

## High scores

On babuni.dev, every run can be saved to one **global list** that keeps the best 100 and shows the top 10. Elsewhere (the desktop app, Serve on Wi-Fi, a local static server) the list is **local** to the browser, under `raketenspiel.highscores.v1`, with an in-memory fallback if storage is blocked. Both sort by points, then level, then the earlier run. The final points are the displayed score plus a bonus from the remaining mothership, power and life.

## Not yet verified

Balance and difficulty in real play, play on a real phone, fidelity to each Flash version, the desktop app and the Windows build of the current source.
