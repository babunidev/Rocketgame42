# Visual and interaction design

How Rocket Game 42 looks and how it is played on each kind of device. Evidence is noted where it matters. The touch layout has been tested in headless Chromium with simulated touches, not yet on a real phone.

## Look

The game draws into a fixed **550 × 400 SVG** area, the size of the Flash original, scaled to fit the screen with black around it. The vector art in `assets.js` was recovered from the earlier version. `runtime.js` adds transforms, glow and explosion effects. The start and score screen sits over the game in a dark navy panel with steel-blue lines and lime highlights (`#eaffab`), in Arial.

## Logo

On 29 October 2026 I asked for a cool, flashy, stylish logo built from the game's own look. An AI image generator (tool and model not recorded) proposed silver-blue slanted lettering, a lime "42", and the blue-silver rocket with an orange exhaust arc. I approved that direction and asked for a square English version, which stacks ROCKET and GAME above the 42. Both are in [assets/branding](../assets/branding/README.md). The square logo also exists as a 627 × 627 WebP. The logo is not used inside the game yet; where it goes is open.

## Controls

| Action | Mouse | Touch screen |
| --- | --- | --- |
| Steer | move the mouse | drag the **STEER** pad (relative, like a trackpad), or touch the playfield to put the ship there |
| Laser | hold the left button | hold **LASER** |
| Seeker missiles | right-click | tap **ROCKETS** |

Touch controls appear on devices whose main pointer is coarse (phones, tablets), and on any device after its first touch.

- **Landscape:** the steering pad fills the left margin, and LASER (larger) and ROCKETS fill the right margin. The game shrinks to leave room for them.
- **Portrait:** the game sits on top with a control bar below it, steering on the left and the two buttons on the right. On narrow screens a line suggests turning the phone sideways.

Steering and the laser work together with two thumbs. A touch on the playfield never fires, so the laser button stays the one place to shoot. The controls dim and ignore touches while the score screen is open. The start screen shows mouse or touch instructions to match the device.

## Score screens

The **welcome** screen shows the top 10 (rank, name, points, level), the controls and a legend of the special asteroids: blue repairs the shield, green refills the laser (both by letting them hit), red does damage (shoot it down). The **game-over** screen shows the run's points and level and a name field (up to 16 characters), then the player's rank, for example "#3 of the top 100", with their row highlighted. A footer says which list is shown: the global one on babuni.dev, or the local one in this browser. On touch devices the name field is not focused automatically, so the keyboard doesn't cover the result, and it uses 16 px text so iPhones don't zoom in.

## Feedback

Score, level, shield, power and mothership indicators, glow and explosion effects, and two explosion sounds. Sound starts after the first touch or click, as browsers require. On the web, iPhones get MP3 copies of the Ogg sounds; sound on a real iPhone is not yet confirmed.

## Accessibility

The page has labelled controls, a semantic score table, status announcements, focus handling on desktop and a named SVG stage. There is no keyboard or controller way to play, and contrast, reduced motion and screen-reader use have not been checked. The game should not be described as accessible to every input method.

## Portfolio material still to make

Before-and-after views of the Flash original and the remake, and a look at the reconstructed art, timing and effects. Presenting them as evidence of a design decision or milestone needs my approval.
