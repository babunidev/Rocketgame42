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

- [ ] Capture approved screenshots/short gameplay footage of original and remake
- [ ] Create a dated visual timeline, explicitly distinguishing evidence from recollection
- [ ] Write a Babuni.dev-led narrative of design motives, reconstruction challenges, and changes of direction
- [ ] Prepare a playable web demo and/or release artifact after testing
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
