# Concept

**Rocket Game 42** (German: *Raketenspiel 42*) is a compact arcade defence game by Babuni: **defend the mothership**. Rockets, asteroids and an enemy craft come down from above. You steer a ship along the bottom, burn them with a laser, and launch seeker missiles earned with your score. Shield, laser power, score and rising levels keep up the pressure until the run ends and your name goes on the board.

This description is drawn from the game itself, its code and screens. It is not a design brief written after the fact.

## What defines it

- A small 550 × 400 playfield, inherited from the Flash version and kept in the remake.
- Direct, physical controls: the ship follows the pointer or your finger, the laser fires while held, and the missiles go all at once.
- Coloured asteroids that ask for different responses: catch blue and green ones, shoot red ones.
- A stock of seeker missiles that grows with your score.
- A high-score board as the goal of every run.

## Direction

- **Playable without Flash:** the game was rebuilt for the browser, with an offline Windows app.
- **Shared locally (2026-10-26):** with **Serve on Wi-Fi**, friends on the same network can play from the desktop app without any setup.
- **An arcade on my website (2026-11-21):** the game should be playable on babuni.dev from every device, with one high-score list for everyone, shown on the welcome and game-over screens, as on an arcade cabinet — that is what I asked for. Phones get simple controls for the three things a pilot does: steer, fire the laser, launch the rockets. A QR code brings people to the game's play module on my website.
- **English name (2026-10-29):** the new logo uses the English title **Rocket Game** and keeps the 42. Renaming inside the game has not been decided.

## History

The repository keeps older SWF and HTML files, including numbered versions up to 42. One Flash launcher once showed a 2009 file timestamp, but **timestamps alone don't date the work or its decisions**. The current browser version was recovered from the v1.42 Electron app, not from the original `.fla`.

Still to be told in my own words: what "42" means, when and why I first made the game, what inspired it, how the mechanics changed across the Flash versions, why I revived it, and how faithful the remake should be compared with new additions. None of this is assumed here.

## Credit

The game, its source, its metadata and the v1.42 readme credit Babuni (as Babuni.dev). Who did which step of the reconstruction can't be told from the imported snapshot.
