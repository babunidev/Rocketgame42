# Raketenspiel 42 by Babuni.dev — development source

Recovered from **Raketenspiel 42 v1.42 Portable.exe** (Electron 44.7.0). Editable HTML/JS/SVG remake of the old Flash game — not the original `.fla`.

**Maker:** [Babuni.dev](https://babuni.dev)

## Layout

| Path | Role |
|------|------|
| `game/gameplay.js` | Rules, scoring, lasers, special asteroids |
| `game/runtime.js` | SVG scene graph / timing (16 Hz logic, 30 FPS draw) |
| `game/assets.js` | Vector art (`window.RAKETENSPIEL_ASSETS`) |
| `game/highscores.js` / `.css` | Local high-score UI |
| `game/index.html` | Shell page |
| `main.cjs` | Electron window + portable data folder |
| `build/icon.png` | Window / build icon |

Original 2009 SWFs (reference only) live in `../RaketenspielOLD/`.

## Edit and play (Linux-friendly)

Needs Node on `PATH` (a local copy is in `.tools/node` if you used the unpack setup):

```bash
cd source
export PATH="$PWD/.tools/node/bin:$PATH"   # if system Node is missing
npm install                                 # once
npm run dev:web                             # http://127.0.0.1:4173/
```

Open that URL in a browser. Change files under `game/`, then refresh.

Electron window (same game, portable-style shell):

```bash
npm start
```

High scores use `localStorage` in the browser, or a **Raketenspiel 42 Data** folder next to the EXE / Electron binary when running as an app.

## Rebuild the Windows portable EXE

```bash
npm run dist
```

Output goes to `dist/` (electron-builder Windows portable). Cross-building from Linux usually needs Wine; building on Windows is the straightforward path.

## Integrity

`source-manifest.json` stores SHA-256 hashes of the shipped `game/` files from v1.42. Re-check after unpack:

```bash
python3 - <<'PY'
import json, hashlib, pathlib
root = pathlib.Path('.')
manifest = json.loads((root/'source-manifest.json').read_text())
for name, expected in manifest['files'].items():
    got = hashlib.sha256((root/'game'/name).read_bytes()).hexdigest()
    print(('OK' if got == expected else 'CHANGED'), name)
PY
```
