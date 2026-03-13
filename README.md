# Coordinate Plane Geometry Game

A small web game to help students learn **Rectangular Coordinate Plane Geometry**: moving points, rotations, and reflections. Built for easy hosting on a server.

## Topics covered

1. **Moving a point** – vertically and/or horizontally (e.g. “Point (3, 4) is moved 2 units right and 3 units down. New coordinates?”).
2. **Rotation** – 90°, 180°, and 270°, both **clockwise** and **anticlockwise** about the origin.
3. **Reflection** – about the **x-axis**, **y-axis**, and about vertical/horizontal lines (e.g. x = 2, y = -1).

## Input types

- **Multiple choice**: choose one of four coordinate options.
- **Value input**: type the answer in the form `x, y` or `(x, y)`.

Each game mixes both types.

## Pages

- **Player page** (home): play the game, answer 10 questions, then optionally enter your name and submit your score.
- **Rank page** (`/rank`): leaderboard of submitted scores (best score first).

## Run locally

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python app.py
   ```
   On Windows, if `python` is not in PATH, try: `py app.py`
4. Open in a browser: **http://localhost:5000** (play) and **http://localhost:5000/rank** (rankings).

## Hosting on a server

- The app listens on `0.0.0.0:5000`, so it accepts connections from other machines.
- For production, run the Flask app behind a reverse proxy (e.g. Nginx or Caddy) and/or use a WSGI server such as **Gunicorn** (Linux/Mac) or **waitress** (Windows):

  **Gunicorn (e.g. on Linux):**
  ```bash
  pip install gunicorn
  gunicorn -w 4 -b 0.0.0.0:5000 app:app
  ```

  **Waitress (e.g. on Windows):**
  ```bash
  pip install waitress
  waitress-serve --host=0.0.0.0 --port=5000 app:app
  ```

- Scores are stored in **SQLite** in the file `scores.db` in the project directory. Back up this file to keep rankings when redeploying.

## Project layout

```
coordinate_game/
├── app.py              # Flask app: routes, API, DB
├── requirements.txt
├── scores.db           # Created on first run (SQLite)
├── README.md
└── static/
    ├── style.css       # Shared styles
    ├── player.html     # Game page (served at /)
    ├── rank.html       # Leaderboard (served at /rank)
    └── game.js         # Game logic and questions
```

## Tech stack

- **Backend**: Flask (Python 3)
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript (vanilla); canvas used for the coordinate grid
