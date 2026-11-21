# Roadmap

What is done, what comes next and what is still open. Each item says what kind of evidence backs it; "tested" means an automated or headless-browser check unless it says "on a real device".

## Done

- [x] Repository and documentation structure (2026-10-26)
- [x] Import of the reconstructed source and the Flash archive (commit `4d50ce6`, 2026-10-26)
- [x] History reconstructed from the evidence, with gaps labelled (2026-10-26, audit #29 on 2026-10-27)
- [x] Serve on Wi-Fi in the Electron source (2026-10-26; not tested on a LAN)
- [x] Logo: wide and square English versions, direction approved (2026-10-29)
- [x] MIT license for the code, with separate terms for the assets (2026-11-13)
- [x] Web release with a global top-100 high-score list and touch controls, live at [babuni.dev/Rocketgame42](https://babuni.dev/Rocketgame42/) (2026-11-21, release `c7c3c22`; 11 server tests and 18 headless-browser checks passed, live site checked)
- [x] Automated tests for the score server (`source/tests/`)
- [x] Website play module with a shareable QR code (2026-11-21)
- [x] Checked the v1.42 hash manifest: none of its six files match, not even at the import (2026-11-21)

## Next

- [ ] Play on a real phone: touch controls, iPhone sound, and a saved score appearing on a second device
- [ ] Scan the QR code with a real phone
- [ ] Run the Electron app with the current source (the new `touch.js`/`touch.css` are in its file allowlist but untested)
- [ ] Build the Windows portable app from the current source and test it, including Ogg sound through the custom protocol
- [ ] Fix the icon for packaging: `source/build/icon.png` exists locally but the root `.gitignore` rule `build/` keeps it out of Git
- [ ] Test Serve on Wi-Fi with a second device: start/stop, port conflicts, addresses shown, sound, separate high scores per browser, firewall
- [ ] Decide what `source/source-manifest.json` is for now (a record of v1.42, or regenerate it for the current files)

## Portfolio

- [ ] Write down my own account of the original game, its versions and why I rebuilt it
- [ ] Screenshots or short gameplay footage of the Flash original and the remake
- [ ] A dated visual timeline that keeps evidence apart from memory
- [ ] Decide where the logo appears in the game
- [ ] Confirm asset credits, rights and release permissions for the historical material

## Open technical questions

- Compare the historical SWFs with the remake in an archival player, where that is lawful and practical.
- Look for the `recovered-source/*.as` files mentioned in comments; they are not in the repository.
- Keyboard or controller play, contrast, reduced motion and screen-reader use are not designed or tested.
- Keep Serve on Wi-Fi to trusted networks: it listens on all IPv4 interfaces.
