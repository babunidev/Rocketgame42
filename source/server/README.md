# Rocket Game 42 on babuni.dev/Rocketgame42 — deployment guide

**Goal:** `https://babuni.dev/Rocketgame42/` serves the game to every device. Everyone shares **one global high-score list** (best 100 runs kept, top 10 shown) on the welcome and game-over screens, like an arcade cabinet. Phones and tablets get on-screen controls.

## How it fits the babuni.dev server

Same pattern as Button Game (`babuni.dev/Buttongame/`), already running on the same Hetzner VPS:

- The existing `babuni.dev` nginx site gets one snippet, included before its catch-all `location /`, like the Morkahja and Button Game snippets.
- The website release folder `/var/www/babuni.dev` is **not** used. The game has its own releases in `/var/www/rocketgame42/releases/` with a `current` symlink, uploaded by the `babunideploy` account (no sudo).
- The game server is a systemd service running as its own `rocketgame42` user on `127.0.0.1:8788` (Button Game uses 8787, Morkahja's API 3000). Scores live in `/var/lib/rocketgame42/scores.sqlite3`, separate from releases, so a deploy or rollback never touches them.

## Files

| File | Purpose |
| --- | --- |
| `rocketgame_server.py` | Game files plus `GET/POST /api/scores` and `/healthz`. Python 3 standard library only. |
| `build-web.sh` | Builds the release folder: web files from `source/game`, MP3 copies of the sounds (iPhone), server, service, snippet, setup script. |
| `publish.sh` | Routine release from Nobara: builds `origin/main`, runs the tests, uploads as `babunideploy`, switches `current`, checks the live site, switches back on failure. |
| `install-on-server.sh` | One-time root setup on the server (`prepare`, `enable`, `rollback`). |
| `rocketgame42.service` | systemd unit. |
| `nginx-rocketgame42-locations.conf` | nginx locations for `/Rocketgame42/` (plus redirects from `/Rocketgame42`, `/rocketgame42`, `/RocketGame42`). |

## Try it locally

```sh
cd source
python3 server/rocketgame_server.py --db /tmp/rg42-test.sqlite3 serve   # http://127.0.0.1:8788/Rocketgame42/
python3 -m unittest discover -s tests -p 'test_*.py'                    # server tests
```

## First installation (once)

1. Copy the setup script to the server with the administrator login and prepare (asks for your sudo password):
   ```sh
   scp -i ~/.ssh/id_ed25519_babuni_server source/server/install-on-server.sh babuni@89.167.120.88:
   ssh -t -i ~/.ssh/id_ed25519_babuni_server babuni@89.167.120.88 'sudo bash install-on-server.sh prepare'
   ```
2. On Nobara, with the changes pushed to GitHub `main`:
   ```sh
   ssh-add ~/.ssh/id_ed25519_babuni_deploy     # if not already unlocked
   source/server/publish.sh            # dry run
   source/server/publish.sh --apply    # uploads the first release
   ```
3. Turn it on (service + nginx route; backs up the site file, runs `nginx -t`, restores it on failure):
   ```sh
   ssh -t -i ~/.ssh/id_ed25519_babuni_server babuni@89.167.120.88 \
     'sudo bash /var/www/rocketgame42/current/install-on-server.sh enable --allow-deploy-restart'
   ```
   `--allow-deploy-restart` lets `babunideploy` run exactly `systemctl restart rocketgame42` without a password, so later releases that change the server code finish on their own.
4. Open `https://babuni.dev/Rocketgame42/` on a phone using mobile data, play a round, save a name, and check it appears on a second device.

## Updating

`source/server/publish.sh --apply`. Game-file changes are live at once; a changed server script is restarted automatically (with the sudo rule above) or the script tells you to run `sudo systemctl restart rocketgame42`. Rollback: the command printed at the end, or for everything `sudo bash /var/www/rocketgame42/current/install-on-server.sh rollback` (removes the route and stops the service; scores are kept).

## Backups

```sh
sudo sqlite3 /var/lib/rocketgame42/scores.sqlite3 ".backup '/root/rocketgame42-scores-$(date +%F).sqlite3'"
```

Restore: stop the service, copy the backup to `/var/lib/rocketgame42/scores.sqlite3` (owner `rocketgame42`), start it.

## Removing an abusive score

```sh
sudo -u rocketgame42 python3 /var/www/rocketgame42/current/rocketgame_server.py --db /var/lib/rocketgame42/scores.sqlite3 list-scores
sudo -u rocketgame42 python3 /var/www/rocketgame42/current/rocketgame_server.py --db /var/lib/rocketgame42/scores.sqlite3 delete-score 42
```

## Built-in limits

- Best **100** runs kept, ordered by points, then level, then the earlier run.
- Names: required, max 16 characters, invisible/control characters removed, shown as plain text.
- Points are capped at 1,000,000,000 and levels at 1–9,999. Per visitor IP: 20 score submissions per minute; requests are limited to 2 KB.
- Scores come from the player's browser, so a determined person can fake one. There are no accounts; use `delete-score` for obvious fakes.
- Offline copies (Electron app, Serve on Wi-Fi, `npm run dev:web`) have no score server and keep using the local list in the browser.
