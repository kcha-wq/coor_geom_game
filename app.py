"""
Coordinate Plane Geometry Game - Flask backend.
Serves the game, validates answers, and stores rankings.
"""
from pathlib import Path
import sqlite3
from flask import Flask, send_from_directory, request, jsonify

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "scores.db"

app = Flask(__name__, static_folder=str(STATIC_DIR))


def get_player_html():
    """Build one self-contained HTML page with CSS and JS inlined via placeholders."""
    html = (STATIC_DIR / "player.html").read_text(encoding="utf-8")
    css = (STATIC_DIR / "style.css").read_text(encoding="utf-8")
    js = (STATIC_DIR / "game.js").read_text(encoding="utf-8")
    # Escape </script> in JS so it does not close the script tag in HTML
    js = js.replace("</script>", "<\\/script>")
    # Wrap JS so any runtime error is shown on the page
    js = "try {\n" + js + "\n} catch (err) {\n  document.body.innerHTML = '<div style=\"padding:2rem;font-family:sans-serif;color:#f87171;\">Game error: ' + (err.message || err) + '</div>';\n}"
    html = html.replace("{{INLINE_CSS}}", css)
    html = html.replace("{{INLINE_JS}}", js)
    return html


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


@app.route("/")
def index():
    try:
        body = get_player_html()
        if "{{INLINE_CSS}}" in body or "{{INLINE_JS}}" in body:
            return (
                "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:2rem;color:#f87171;'>"
                "<h1>Build error</h1><p>Placeholders were not replaced. Check that player.html contains {{INLINE_CSS}} and {{INLINE_JS}}.</p></body></html>",
                500,
                {"Content-Type": "text/html; charset=utf-8"},
            )
        return body, 200, {"Content-Type": "text/html; charset=utf-8"}
    except Exception as e:
        return (
            "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:2rem;color:#f87171;'>"
            "<h1>Server error</h1><pre>" + str(e) + "</pre></body></html>",
            500,
            {"Content-Type": "text/html; charset=utf-8"},
        )


@app.route("/rank")
def rank_page():
    return send_from_directory(app.static_folder, "rank.html")


@app.route("/api/rank", methods=["GET"])
def get_rank():
    conn = get_db()
    rows = conn.execute(
        "SELECT player_name, score, total, created_at FROM scores ORDER BY score DESC, total ASC LIMIT 100"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/submit", methods=["POST"])
def submit_score():
    data = request.get_json()
    if not data or "player_name" not in data or "score" not in data or "total" not in data:
        return jsonify({"ok": False, "error": "Missing player_name, score, or total"}), 400
    name = (data["player_name"] or "").strip()[:80]
    score = int(data["score"])
    total = int(data["total"])
    if total <= 0:
        return jsonify({"ok": False, "error": "Invalid total"}), 400
    conn = get_db()
    conn.execute(
        "INSERT INTO scores (player_name, score, total) VALUES (?, ?, ?)",
        (name or "Anonymous", score, total),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
