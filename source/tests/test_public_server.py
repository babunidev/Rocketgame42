"""Tests for server/rocketgame_server.py (run from source/:
python3 -m unittest discover -s tests -p 'test_*.py')."""

import http.client
import json
import sys
import tempfile
import threading
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "server"))
import rocketgame_server as rs  # noqa: E402

GAME = Path(__file__).resolve().parent.parent / "game"


class ServerTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / "scores.sqlite3"
        self.start()

    def start(self):
        self.app = rs.App(GAME, self.db)
        self.server = rs.make_server("127.0.0.1", 0, self.app)
        self.port = self.server.server_port
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()
        self.app.scores.conn.close()

    def tearDown(self):
        self.stop()
        self.tmp.cleanup()

    def req(self, method, path, body=None, raw=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
        conn.request(method, path, body=data, headers={"Content-Type": "application/json"} if data else {})
        res = conn.getresponse()
        payload = res.read()
        conn.close()
        return res, payload

    def post(self, body):
        res, payload = self.req("POST", "/Rocketgame42/api/scores", body)
        return res.status, json.loads(payload)

    def test_serves_game_files_under_base_path(self):
        res, body = self.req("GET", "/Rocketgame42/")
        self.assertEqual(res.status, 200)
        self.assertIn(b"touch-controls", body)
        res, _ = self.req("GET", "/Rocketgame42/gameplay.js")
        self.assertEqual(res.status, 200)
        self.assertIn("javascript", res.getheader("Content-Type"))
        res, _ = self.req("GET", "/Rocketgame42/sounds/roket-explosion.ogg")
        self.assertEqual(res.getheader("Content-Type"), "audio/ogg")

    def test_bare_base_path_redirects(self):
        res, _ = self.req("GET", "/Rocketgame42")
        self.assertEqual(res.status, 301)
        self.assertEqual(res.getheader("Location"), "/Rocketgame42/")

    def test_nothing_outside_the_game_folder(self):
        for path in ("/Rocketgame42/../server/rocketgame_server.py", "/Rocketgame42/%2e%2e/main.cjs",
                     "/Rocketgame42/.hidden", "/index.html", "/Rocketgame42/missing.js"):
            res, _ = self.req("GET", path)
            self.assertEqual(res.status, 404, path)

    def test_empty_list_and_health(self):
        res, payload = self.req("GET", "/Rocketgame42/api/scores")
        self.assertEqual(res.status, 200)
        self.assertEqual(json.loads(payload)["scores"], [])
        self.assertEqual(res.getheader("Cache-Control"), "no-store")
        res, _ = self.req("GET", "/Rocketgame42/healthz")
        self.assertEqual(res.status, 200)

    def test_ranking_points_then_level_then_earlier(self):
        self.post({"name": "Alpha", "points": 500, "level": 3})
        self.post({"name": "Bravo", "points": 900, "level": 5})
        self.post({"name": "Charlie", "points": 500, "level": 4})
        status, data = self.post({"name": "Delta", "points": 500, "level": 4})
        self.assertEqual(status, 200)
        self.assertEqual([s["name"] for s in data["scores"]], ["Bravo", "Charlie", "Delta", "Alpha"])
        self.assertEqual(data["rank"], 3)
        self.assertEqual(data["scores"][0], {"name": "Bravo", "points": 900, "level": 5})

    def test_names_are_cleaned_and_required(self):
        _, data = self.post({"name": "  Ace‮\x00  Pilot  with a long name ", "points": 1, "level": 1})
        self.assertEqual(data["scores"][0]["name"], "Ace Pilot with a")
        status, _ = self.post({"name": " ​ ", "points": 1, "level": 1})
        self.assertEqual(status, 400)

    def test_invalid_scores_rejected_or_bounded(self):
        for body in ({"name": "X", "points": "10", "level": 1}, {"name": "X", "points": True, "level": 1},
                     {"name": "X", "level": 1}, ["not", "an", "object"]):
            status, _ = self.post(body)
            self.assertEqual(status, 400, body)
        res, _ = self.req("POST", "/Rocketgame42/api/scores", raw=b"{nope")
        self.assertEqual(res.status, 400)
        _, data = self.post({"name": "Big", "points": 10**15, "level": -4})
        self.assertEqual(data["scores"][0]["points"], rs.MAX_POINTS)
        self.assertEqual(data["scores"][0]["level"], 1)

    def test_only_best_100_kept(self):
        board = self.app.scores
        for i in range(105):
            board.add_score({"name": f"P{i}", "points": i, "level": 1})
        data = board.add_score({"name": "Low", "points": 0, "level": 1})
        self.assertIsNone(data["rank"])
        self.assertEqual(len(data["scores"]), 100)
        self.assertEqual(data["scores"][-1]["points"], 5)
        self.assertEqual(len(board.admin_rows()), 100)

    def test_scores_survive_restart(self):
        self.post({"name": "Keeper", "points": 42, "level": 2})
        self.stop()
        self.start()
        _, payload = self.req("GET", "/Rocketgame42/api/scores")
        self.assertEqual(json.loads(payload)["scores"][0]["name"], "Keeper")

    def test_rate_limit(self):
        for _ in range(rs.SUBMITS_PER_MINUTE):
            self.assertEqual(self.post({"name": "Spam", "points": 1, "level": 1})[0], 200)
        self.assertEqual(self.post({"name": "Spam", "points": 1, "level": 1})[0], 429)

    def test_delete_score(self):
        self.post({"name": "Fake", "points": 999999, "level": 1})
        row_id = self.app.scores.admin_rows()[0][0]
        self.assertEqual(self.app.scores.delete(row_id), 1)
        self.assertEqual(self.app.scores.list_scores()["scores"], [])


if __name__ == "__main__":
    unittest.main()
