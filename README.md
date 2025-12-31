# Adventra
This guide explains how our team will use Git and GitHub to collaborate on Aventra.
Following these steps will keep our project organized and prevent us from overwriting each other’s work.

🔹 Branch Strategy

main → always stable, production-ready code.

dev → shared development branch. All features are merged here first.

feature/xxx → each new feature or task gets its own branch.

Example: feature/login-signup, feature/ai-itinerary-creator

👉 Only merge into main when dev has been tested and stable.

🔹 Workflow Steps

1. Clone the Repo (first time only)
   git clone <repo-url>
   cd aventra_project_swe

2. Create a New Branch

Always branch off of dev:

git checkout dev
git pull origin dev # make sure you have the latest changes
git checkout -b feature/your-feature-name

3. Work & Commit

Make changes locally, then save progress with commits:

git add .
git commit -m "Add login form UI"

4. Push Your Branch

Send your branch to GitHub:

git push origin feature/your-feature-name

5. Open a Pull Request (PR)

On GitHub, open a PR from your branch → dev.
# aventra_project_swe

Aventra — semester project (SWE) demonstrating a small travel web app with a React frontend, Node proxy, and Python Flask services.

This README explains how to set up and run the project locally, highlights key features, and lists configuration and troubleshooting steps.

---

## Key Features
- Search and browse "Things to Do" (POIs) using OpenTripMap and OSM as a fallback.
- Hotel (Stays) search via a Flask service.
- Flight lookup via a Flask service.
- Autocomplete for addresses (Nominatim) and airports.
- Itinerary builder (persisted to localStorage) and review pages.

---

## Prerequisites
- macOS / Linux / Windows with a POSIX shell (zsh recommended).
- Node.js (v16+ recommended) and `npm`.
- Python 3.10+ with `pip`.
- Optional: GitHub CLI (`gh`) or Git configured with SSH/credentials for pushing.

---

## Quick Setup
Open a terminal in the project root (`/Users/siyam/Aventra/aventra_project_swe`):

1) Install frontend deps (Create React App)
```bash
cd /Users/Aventra/aventra_project_swe
npm install
```

2) Install backend (Node proxy) deps
```bash
cd backend
npm install
```

3) (Optional) Create & activate a Python virtualenv, then install Python deps
```bash
cd /Users/siyam/Aventra/aventra_project_swe
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Running the app (development)
There are three components to run locally:

- Flask content service(s) — run both Python services
- Node proxy — serves proxied API routes used by the frontend
- React frontend — development server

Recommended order (open separate terminals):

1) Start the Flask services (content & flights/hotels)
```bash
# Terminal A
cd /Users/Aventra/aventra_project_swe
python3 app.py      # content/search service (port 5000)

# Terminal B
cd /UsersAventra/aventra_project_swe
python3 flaskapp.py # flights/hotels/airports service (port 5001)
```

2) Start the Node proxy
```bash
# Terminal C
cd /Users/Aventra/aventra_project_swe/backend
npm start
# default proxy port used by the frontend is 8080 (see backend/server.js)
```

3) Start the React frontend
```bash
# Terminal D
cd /Users/Aventra/aventra_project_swe
npm start
# opens on http://localhost:3000 by default
```

Verify in the browser: http://localhost:3000

---

## Configuration & Environment
- If you have an OpenTripMap API key, provide it to the Node proxy or the Flask service that calls OpenTripMap. Common places to configure keys:
   - `backend/.env` (create if needed) — add `OPENTRIPMAP_API_KEY=your_key`
   - Or set environment variables in the shell before starting the server:
      ```bash
      export OPENTRIPMAP_API_KEY="your_key"
      ```
- If the Node proxy is modified, you must restart it for changes to take effect.
- Ports used by the project (defaults):
   - Frontend (CRA): 3000
   - Node proxy: 8080
   - Flask content service: 5000
   - Flask flights/hotels service: 5001

---

## How to push changes to GitHub (quick)
```bash
git checkout main        # or the branch you want to push
git add -A
git commit -m "Describe changes"
git fetch origin
git pull --rebase origin main
git push -u origin main
```
If the push is rejected because the remote contains new commits, run the `fetch` + `pull --rebase` step, resolve any conflicts, and push again.

---

## Troubleshooting
- JSON parse errors in the frontend: usually caused by the Node proxy returning HTML (e.g. an error page) instead of JSON. Ensure the Node proxy is running and the endpoint path is correct.
- `npm start` in `backend` exits with code 130 or crashes: stop any existing Node process that uses the same port, check logs, fix errors, then restart.
- Flask services return errors: check the Python terminal output for stack traces and ensure required packages are installed.
- CORS/network issues: the frontend talks to the Node proxy (port 8080) which in turn forwards to Flask or external services. Verify all three components are running.

Helpful quick checks:
```bash
curl "http://127.0.0.1:8080/api/opentripmap/radius?lat=48.8566&lon=2.3522&limit=5"
curl "http://127.0.0.1:8080/api/flights/search?origin=ATL&destination=JFK"
curl "http://127.0.0.1:5001/api/hotels/search?location=Paris"
```

---

## Project Structure (high level)
- `src/` — React frontend source (pages, components, styles)
- `backend/` — Node proxy and server configuration
- `app.py` — Flask service for content/search
- `flaskapp.py` — Flask service for flights/hotels/airports
- `scripts/` — utility scripts (e.g., `import_events.py`)

---

If you'd like, I can also:
- add a sample `.env.example` with recommended environment variables,
- commit the README changes for you and push to `main`, or
- generate a short developer checklist for running the app locally.

If anything in this README needs to be more specific to your environment (keys, ports), tell me which values you want added and I will update the file.
