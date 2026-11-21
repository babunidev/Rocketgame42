#!/usr/bin/env python3
"""Rocket Game 42 public server: the web game and one global top-100
high-score list, for https://babuni.dev/Rocketgame42/.

Standard library only (Python 3.9+). Runs on loopback behind the babuni.dev
nginx HTTPS site; see server/README.md. Adapted from the Button Game server.

    python3 server/rocketgame_server.py --db /var/lib/rocketgame42/scores.sqlite3 \
        serve --web-root /var/www/rocketgame42/current/www

Administration (works while the service is running):

    python3 server/rocketgame_server.py --db ... list-scores
    python3 server/rocketgame_server.py --db ... delete-score ID
"""

import argparse
import json
import math
import re
import sqlite3
import sys
import threading
import time
from collections import deque
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

MAX_SCORES = 100          # Only the best 100 runs are kept; 101+ are removed.
MAX_NAME = 16             # Same limit as the game's name field.
MAX_POINTS = 1_000_000_000
MAX_LEVEL = 9_999
MAX_BODY = 2048
SUBMITS_PER_MINUTE = 20   # Per client IP.
CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f-\x9f​-‏‪-‮⁦-⁩]")


def bounded(value, low, high):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError("points and level must be numbers")
    return int(min(max(low, value), high))


def clean_name(value):
    text = CONTROL_CHARS.sub("", str(value or ""))
    return " ".join(text.split())[:MAX_NAME]


class Leaderboard:
    """SQLite-backed global high scores, trimmed to the best MAX_SCORES.

    Order matches the game's local board: points, then level, then the
    earlier run first.
    """

    ORDER = "points DESC, level DESC, id ASC"

    def __init__(self, db_file):
        self.db_file = str(db_file)
        if self.db_file != ":memory:":
            Path(self.db_file).parent.mkdir(parents=True, exist_ok=True)
        self.lock = threading.Lock()
        self.conn = sqlite3.connect(self.db_file, check_same_thread=False)
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA synchronous=FULL")
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                points INTEGER NOT NULL,
                level INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )""")
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS scores_rank ON scores (points DESC, level DESC, id ASC)")
        self.conn.commit()

    def _top(self):
        return self.conn.execute(
            f"SELECT id, name, points, level FROM scores ORDER BY {self.ORDER} LIMIT ?",
            (MAX_SCORES,)).fetchall()

    @staticmethod
    def _public(row):
        return {"name": row[1], "points": row[2], "level": row[3]}

    def list_scores(self):
        with self.lock:
            return {"scores": [self._public(r) for r in self._top()], "maxScores": MAX_SCORES}

    def add_score(self, obj):
        name = clean_name(obj.get("name"))
        if not name:
            raise ValueError("name is required")
        entry = (
            name,
            bounded(obj.get("points"), 0, MAX_POINTS),
            bounded(obj.get("level"), 1, MAX_LEVEL),
            datetime.now(timezone.utc).isoformat(timespec="seconds"),
        )
        with self.lock, self.conn:
            new_id = self.conn.execute(
                "INSERT INTO scores (name, points, level, created_at) VALUES (?, ?, ?, ?)",
                entry).lastrowid
            self.conn.execute(
                f"DELETE FROM scores WHERE id NOT IN "
                f"(SELECT id FROM scores ORDER BY {self.ORDER} LIMIT ?)", (MAX_SCORES,))
            rows = self._top()
        rank = next((i + 1 for i, r in enumerate(rows) if r[0] == new_id), None)
        return {"scores": [self._public(r) for r in rows], "rank": rank, "maxScores": MAX_SCORES}

    def admin_rows(self):
        with self.lock:
            return self.conn.execute(
                f"SELECT id, name, points, level, created_at FROM scores ORDER BY {self.ORDER}"
            ).fetchall()

    def delete(self, score_id):
        with self.lock, self.conn:
            return self.conn.execute("DELETE FROM scores WHERE id = ?", (score_id,)).rowcount


class RateLimiter:
    def __init__(self, per_minute):
        self.per_minute = per_minute
        self.lock = threading.Lock()
        self.hits = {}

    def allow(self, client):
        now = time.monotonic()
        with self.lock:
            if len(self.hits) > 50_000:
                self.hits = {k: q for k, q in self.hits.items() if q and now - q[-1] < 60}
            q = self.hits.setdefault(client, deque())
            while q and now - q[0] >= 60:
                q.popleft()
            if len(q) >= self.per_minute:
                return False
            q.append(now)
            return True


class GameHandler(SimpleHTTPRequestHandler):
    server_version = "RocketGame42"
    sys_version = ""
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".ogg": "audio/ogg", ".mp3": "audio/mpeg",
                      ".svg": "image/svg+xml", ".png": "image/png"}

    def __init__(self, *args, app, **kwargs):
        self.app = app
        super().__init__(*args, directory=str(app.web_root), **kwargs)

    def log_message(self, fmt, *args):
        # Short access log without client IPs or bodies (journald keeps it).
        sys.stderr.write((fmt % args if args else fmt) + "\n")

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        if not self._headers_buffer or b"Cache-Control" not in b"".join(self._headers_buffer):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def client_ip(self):
        if self.app.trust_proxy:
            real = self.headers.get("X-Real-IP")
            if real:
                return real.strip()[:64]
            fwd = self.headers.get("X-Forwarded-For")
            if fwd:
                return fwd.split(",")[-1].strip()[:64]
        return self.client_address[0]

    def json_response(self, result, status=200):
        payload = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def route(self):
        """Path inside the game, "" for the bare base path, None if outside it."""
        path = unquote(urlsplit(self.path).path)
        base = self.app.base_path
        if not base:
            return path
        if path == base:
            return ""  # Needs a trailing slash so relative URLs resolve.
        if path.startswith(base + "/"):
            return path[len(base):]
        return None

    def redirect(self, location):
        self.send_response(301)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def public_file(self, route):
        """Only files of the built game folder: no dotfiles, nothing outside it."""
        if route is None:
            return False
        if route == "/":
            return True
        parts = Path(route).parts
        if ".." in parts or any(p.startswith(".") for p in parts):
            return False
        root = self.app.web_root.resolve()
        target = (root / route.lstrip("/")).resolve()
        return target.is_file() and target.is_relative_to(root)

    def not_found(self):
        return self.json_response({"error": "not found"}, 404)

    def do_HEAD(self):
        route = self.route()
        if route == "":
            return self.redirect(self.app.base_path + "/")
        if not self.public_file(route):
            self.send_response(404)
            self.send_header("Content-Length", "0")
            return self.end_headers()
        self.path = route
        return super().do_HEAD()

    def do_GET(self):
        route = self.route()
        if route == "":
            return self.redirect(self.app.base_path + "/")
        if route == "/api/scores":
            return self.json_response(self.app.scores.list_scores())
        if route == "/healthz":
            return self.json_response({"ok": True})
        if not self.public_file(route):
            return self.not_found()
        self.path = route
        return super().do_GET()

    def do_POST(self):
        if self.route() != "/api/scores":
            return self.not_found()
        if not self.app.limiter.allow(self.client_ip()):
            return self.json_response({"error": "too many requests"}, 429)
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size < 1 or size > MAX_BODY:
                return self.json_response({"error": "invalid request size"}, 400)
            obj = json.loads(self.rfile.read(size))
            if not isinstance(obj, dict):
                raise ValueError("expected a JSON object")
            return self.json_response(self.app.scores.add_score(obj))
        except (ValueError, UnicodeDecodeError) as exc:
            return self.json_response({"error": str(exc)[:200]}, 400)


class App:
    def __init__(self, web_root, db_file, base_path="/Rocketgame42", trust_proxy=False):
        # Not resolved here: web_root may be the `current` release symlink, and a
        # switched symlink must take effect without a restart.
        self.web_root = Path(web_root).absolute()
        if not (self.web_root / "index.html").is_file():
            raise SystemExit(f"No index.html in web root {self.web_root}")
        self.base_path = base_path.rstrip("/")
        self.trust_proxy = trust_proxy
        self.scores = Leaderboard(db_file)
        self.limiter = RateLimiter(SUBMITS_PER_MINUTE)


def make_server(bind, port, app):
    server = ThreadingHTTPServer((bind, port), partial(GameHandler, app=app))
    server.daemon_threads = True
    return server


def main(argv=None):
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Rocket Game 42 public server")
    parser.add_argument("--db", type=Path, default=Path.cwd() / "rocketgame42-scores.sqlite3")
    sub = parser.add_subparsers(dest="command")
    serve = sub.add_parser("serve", help="Run the web server (default)")
    serve.add_argument("--bind", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8788)
    # Deploy bundle: www/ beside this script. Repository checkout: source/game.
    serve.add_argument("--web-root", type=Path,
                       default=here / "www" if (here / "www" / "index.html").is_file()
                       else here.parent / "game")
    serve.add_argument("--base-path", default="/Rocketgame42")
    serve.add_argument("--trust-proxy", action="store_true",
                       help="Use X-Real-IP / X-Forwarded-For from the local reverse proxy")
    sub.add_parser("list-scores", help="Print all stored scores with their IDs")
    delete = sub.add_parser("delete-score", help="Remove one score by ID")
    delete.add_argument("id", type=int)
    args = parser.parse_args(argv)

    if args.command == "list-scores":
        for row in Leaderboard(args.db).admin_rows():
            print("%6d  %-16s %12d  L%-4d %s" % row)
        return
    if args.command == "delete-score":
        removed = Leaderboard(args.db).delete(args.id)
        print("Deleted" if removed else "No score with that ID")
        return

    if args.command is None:
        args = parser.parse_args(["--db", str(args.db), "serve"])
    app = App(args.web_root, args.db, args.base_path, args.trust_proxy)
    server = make_server(args.bind, args.port, app)
    print(f"Rocket Game 42 server on http://{args.bind}:{server.server_port}{app.base_path}/", flush=True)
    print(f"High-score database: {args.db} (best {MAX_SCORES} kept)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
