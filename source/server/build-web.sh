#!/usr/bin/env bash
# Build the folder to copy to the server: the public game files from source/game,
# MP3 copies of the sounds for browsers without Ogg (iPhone/Safari), and the
# server script, service, nginx snippet and setup script.
# Usage: source/server/build-web.sh [OUTDIR]   (default: source/dist/rocketgame42-server)
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GAME="$SRC/game"
OUT="${1:-$SRC/dist/rocketgame42-server}"

rm -rf "$OUT"
mkdir -p "$OUT/www/sounds"
# Web files only. wifi.js is harmless on the web (it needs the Electron preload).
for f in index.html highscores.css touch.css sfx.js assets.js gameplay.js missiles.js runtime.js \
         highscores.js touch.js wifi.js; do
  cp "$GAME/$f" "$OUT/www/"
done
cp "$GAME/sounds/"*.ogg "$OUT/www/sounds/"
cp "$SRC/build/icon.png" "$OUT/www/icon.png"

if command -v ffmpeg >/dev/null; then
  for source in "$OUT/www/sounds/"*.ogg; do
    ffmpeg -loglevel error -y -i "$source" -codec:a libmp3lame -q:a 4 "${source%.ogg}.mp3"
  done
else
  echo "WARNING: ffmpeg not found, no MP3 sounds: iPhone/Safari may be silent." >&2
fi

cp "$SRC/server/rocketgame_server.py" "$SRC/server/rocketgame42.service" \
   "$SRC/server/install-on-server.sh" "$SRC/server/nginx-rocketgame42-locations.conf" "$OUT/"
cmp "$GAME/index.html" "$OUT/www/index.html"
echo "Built $OUT ($(find "$OUT/www" -type f | wc -l) web files)"
