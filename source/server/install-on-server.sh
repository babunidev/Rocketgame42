#!/usr/bin/env bash
# One-time root setup for Rocket Game 42 on the babuni.dev server. Babuni runs it
# with sudo on the server, in two phases (same as Button Game):
#
#   sudo bash install-on-server.sh prepare     # service user + release folder for babunideploy
#   (then, on Nobara: source/server/publish.sh --apply   uploads the first release)
#   sudo bash install-on-server.sh enable [--allow-deploy-restart]
#   sudo bash install-on-server.sh rollback    # removes the nginx route and stops the service; keeps scores
#
# Nothing here touches the website files, Button Game, Morkahja or their data.
set -euo pipefail

APP=/var/www/rocketgame42
SVC=rocketgame42
PORT=8788
DEPLOY_USER=babunideploy
SITE=/etc/nginx/sites-available/babuni.dev
SNIPPET=/etc/nginx/snippets/rocketgame42-locations.conf
INCLUDE_LINE="include snippets/rocketgame42-locations.conf;"
SUDOERS=/etc/sudoers.d/rocketgame42-deploy

[ "$(id -u)" = 0 ] || { echo "Run with sudo." >&2; exit 1; }
phase="${1:-}"

case "$phase" in
prepare)
  id "$SVC" >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin "$SVC"
  install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP" "$APP/releases"
  command -v python3 >/dev/null || { echo "python3 is missing" >&2; exit 1; }
  ss -ltn | grep -q "127.0.0.1:$PORT " && { echo "Port $PORT is already in use." >&2; exit 1; }
  ls -ld "$APP" "$APP/releases"
  echo "Prepared. Now run source/server/publish.sh --apply on Nobara, then: sudo bash $0 enable"
  ;;

enable)
  test -f "$APP/current/rocketgame_server.py" || { echo "No release yet: run source/server/publish.sh --apply first." >&2; exit 1; }
  stamp="$(date +%Y%m%d-%H%M%S)"

  # 1. Service on 127.0.0.1:8788.
  install -m 644 "$APP/current/$SVC.service" "/etc/systemd/system/$SVC.service"
  systemctl daemon-reload
  systemctl enable --now "$SVC"
  for _ in $(seq 1 20); do
    curl -fsS "http://127.0.0.1:$PORT/Rocketgame42/healthz" >/dev/null 2>&1 && break
    sleep 0.5
  done
  curl -fsS "http://127.0.0.1:$PORT/Rocketgame42/healthz" >/dev/null || { journalctl -u "$SVC" -n 30 --no-pager; exit 1; }
  echo "Service healthy on 127.0.0.1:$PORT"

  # 2. Nginx route, included before the website's catch-all location.
  cp -a "$SITE" "$SITE.bak-rocketgame42-$stamp"
  install -m 644 "$APP/current/nginx-rocketgame42-locations.conf" "$SNIPPET"
  if ! grep -qF "$INCLUDE_LINE" "$SITE"; then
    count="$(grep -cE '^[[:space:]]*location / \{' "$SITE" || true)"
    if [ "$count" != 1 ]; then
      echo "Expected exactly one 'location / {' in $SITE, found $count. Add this line by hand" >&2
      echo "inside the HTTPS babuni.dev server block, before 'location /': $INCLUDE_LINE" >&2
      exit 1
    fi
    sed -i -E "s|^([[:space:]]*)location / \{|\1$INCLUDE_LINE\n\1location / {|" "$SITE"
  fi
  if ! nginx -t; then
    cp -a "$SITE.bak-rocketgame42-$stamp" "$SITE"; rm -f "$SNIPPET"
    echo "nginx -t failed: site file restored, nothing reloaded." >&2
    exit 1
  fi
  systemctl reload nginx
  diff -u "$SITE.bak-rocketgame42-$stamp" "$SITE" || true

  # 3. Optional: let the deploy account restart only this service (for server-code updates).
  if [ "${2:-}" = "--allow-deploy-restart" ]; then
    printf '%s ALL=(root) NOPASSWD: /usr/bin/systemctl restart %s\n' "$DEPLOY_USER" "$SVC" > "$SUDOERS.tmp"
    visudo -cf "$SUDOERS.tmp" && install -m 440 "$SUDOERS.tmp" "$SUDOERS"; rm -f "$SUDOERS.tmp"
    echo "Installed $SUDOERS (restart $SVC only)"
  fi

  # 4. Checks.
  ufw status 2>/dev/null | grep -q "$PORT" && echo "WARNING: ufw mentions port $PORT; it should stay closed." >&2
  for url in https://www.babuni.dev/Rocketgame42/healthz https://babuni.dev/Rocketgame42/healthz \
             https://babuni.dev/Buttongame/healthz https://www.babuni.dev/; do
    printf '%s -> ' "$url"; curl -sS -o /dev/null -w '%{http_code}\n' "$url"
  done
  echo "Rollback: sudo bash $0 rollback   (nginx backup: $SITE.bak-rocketgame42-$stamp)"
  ;;

rollback)
  stamp="$(date +%Y%m%d-%H%M%S)"
  cp -a "$SITE" "$SITE.bak-rocketgame42-rollback-$stamp"
  sed -i "\|$INCLUDE_LINE|d" "$SITE"
  rm -f "$SNIPPET" "$SUDOERS"
  nginx -t && systemctl reload nginx
  systemctl disable --now "$SVC" || true
  echo "Route removed and service stopped. Scores kept in /var/lib/$SVC, releases in $APP."
  ;;

*)
  sed -n '2,12p' "$0"; exit 1
  ;;
esac
