# Roadmap — Preservation and Portfolio

Status terms: verified in repository / source-identified but runtime-unverified / proposed.

## Foundation

- [x] Establish GitHub documentation structure (2026-10-26)
- [x] Import modern source and preserved Flash material (commit 4d50ce6, 2026-10-26)
- [x] Audit available source documentation and reconstruct an evidence-labeled initial history
- [ ] Gather Babuni.dev's account of the original game, versions and remake decisions

## Technical verification

- [ ] Run browser version and document game-loop/control results
- [ ] Check electron-builder packaging and missing icon reference
- [ ] Check custom protocol access to OGG sound assets in portable build
- [ ] Verify SHA-256 manifest against shipped game files
- [ ] Run historical SWFs in a controlled archival player and compare behavior where lawful/practical
- [ ] Add maintainable automated smoke/regression tests

## Portfolio presentation

- [x] Create an initial logo proposal informed by the existing game (2026-10-29)
- [x] Creator review of initial logo direction (placement remains open)

- [ ] Capture approved screenshots/short gameplay footage of original and remake
- [ ] Create a dated visual timeline, explicitly distinguishing evidence from recollection
- [ ] Write a Babuni.dev-led narrative of design motives, reconstruction challenges, and changes of direction
- [x] Prepare a playable web release with a global high-score list and touch controls (source ready 2026-11-21; see `source/server/README.md`)
- [x] Deploy to `https://babuni.dev/Rocketgame42/` (2026-11-21, release `c7c3c22`)
- [ ] Test on a real phone, iPhone sound included, and a score shared between two devices
- [ ] Decide whether the babuni.dev website links to the game
- [ ] Confirm asset credits, licensing and release permissions

## Status

The repository contains implemented source, not a blank prototype. **No successful runtime or build tests are recorded by this audit.**

## Documentation audit #29 — 2026-10-27

- [x] Reconcile the imported Flash/modern source history with the later Serve on Wi-Fi extension in README, architecture, decisions and development journal.
- [x] Distinguish browser hosting from synchronized multiplayer; document that the Electron-only host controls are not available to remote browser visitors.
- [ ] Run a packaged desktop build and test start/stop hosting, port conflicts, LAN address display, HTTP assets and audio from a second device.
- [ ] Confirm that desktop-local and remotely opened browser high scores remain separate, and record browser-storage persistence.
- [ ] Review listener exposure and firewall considerations before using the host outside a trusted LAN.
- [ ] Resolve the referenced Windows icon, legacy source provenance, asset rights and build/release verification before publication.

These are documentation checks, not new feature commitments. No runtime acceptance was carried out in this audit.

## Logo follow-up — 2026-10-29

- [x] Creator approved the original logo’s visual direction.
- [x] Create a square English Rocket Game logo retaining 42.
- [ ] Decide where to integrate the logo in the UI.
