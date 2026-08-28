# Digital Alpha — Transactions & Rewards Dashboard

A consumer dashboard for browsing credit-card transactions, viewing spend analytics, and earning/redeeming reward coins on successful payments. Built as the Digital Alpha Technologies take-home assignment.

## Live URLs

- **Frontend (Netlify):** https://digital-alpha-takehome.netlify.app
- **Backend API (Render):** https://digital-alpha-api-wcxe.onrender.com

> Note: the backend is on Render's free tier and spins down after inactivity — the first request after a period of idleness can take 30–60 seconds to respond. This is expected, not a bug.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript, hand-built component system (design tokens, Button, Card, Modal, Table) |
| Charting | Recharts |
| Backend | Python, FastAPI |
| Database | PostgreSQL (Neon, hosted), SQLAlchemy ORM |
| Frontend hosting | Netlify |
| Backend hosting | Render (free tier) |
| Database hosting | Neon (free tier) |

## Local setup (under 5 minutes)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- A PostgreSQL instance (local, or a free Neon project — see below)

### 1. Clone the repo
```bash
git clone https://github.com/Raja-Mehdi-Ali-Khan/digital-alpha-takehome.git
cd digital-alpha-takehome
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (or export directly) with:
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
```

Seed the database (creates schema + loads the ~10,000 provided transactions), then calculate the starting coin balance from successful transactions:
```bash
python -m scripts.seed
python -m scripts.calculate_coins
```

Run the backend:
```bash
uvicorn app.main:app --reload --port 8000
```
API is now live at `http://localhost:8000`.

### 3. Frontend setup
In a new terminal:
```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/` with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```
App is now live at `http://localhost:3000`.

## What's done

- Transactions table (hand-built, no component library): sticky header, loading/empty/error states, hover/focus states, responsive layout
- Server-side pagination, filtering (category, status), merchant search (debounced), and sorting (date/amount) — all against the live backend, not client-side over the full dataset
- Row click → transaction detail modal
- Category spend chart (Recharts) with click-to-filter on the transactions table
- Persistent coin balance, always visible in the header
- Rewards catalogue (6 items) with a select → confirm → done redeem flow
- Backend rejects invalid redeems (unknown reward ID, insufficient balance) with proper HTTP status codes; the UI shows the error without corrupting the displayed balance
- PostgreSQL schema (not a JSON dump) with a documented, one-command seed script
- Deployed frontend (Netlify) and backend (Render), connected to hosted Postgres (Neon)

## What's not done / known issues

- **Second chart (monthly trend)** — not implemented; only the category breakdown chart (Tier 1 minimum) was built given the time budget.
- **Two-way cross-filtering** — chart-click filters the table (one-way), but table filters do not currently reshape the chart. This was explicitly the "nice to have" tier in the brief.
- **Optimistic balance update with rollback** — the redeem flow waits for the backend's response before updating the displayed balance, rather than updating optimistically and rolling back on failure. The current approach is simpler and still meets the "never leave the balance in a wrong state" requirement, since nothing changes on screen until the backend confirms.
- **Automated tests** — none included; all verification was done manually against the live and local API.
- **Accessibility** — the table and modal have keyboard focus states and the modal has a focus trap + Escape-to-close, but a full accessibility pass (ARIA labeling throughout, screen-reader testing) was not done.
- **Visual polish** — functional and reasonably clean, but not fully refined; further passes on spacing/typography/empty states would be the next priority with more time.

## Notes on data / dataset
The seed script loads the ~10,000-row `transactions.json` dataset provided with the assignment into normalized PostgreSQL tables (transactions, categories, rewards catalogue, redemptions, and a coin balance record) rather than storing it as a single JSON blob.

See `ASSUMPTIONS.md` for product decisions made where the brief left things open, `DECISIONS.md` for technical reasoning behind key implementation choices, and `AI-USAGE.md` for how AI tools were used during the build.
