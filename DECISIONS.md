# Technical Decisions

## Pagination vs. virtualization (Transactions table)
**Decision:** Server-side pagination, 20 rows per page, rather than client-side virtualization of all ~10,000 rows.
**Why:** The backend already supports filtering, sorting, and pagination as query parameters, so paginating server-side keeps each response small and the table feels instant regardless of dataset size. It's also simpler and more reliable to get right under a tight time budget than a virtualized scroll container, and it naturally scales if the dataset grows well past 10k rows. Virtualization would only be strictly necessary if the product required loading and scrolling through the *entire* dataset client-side in one view, which the brief doesn't require (filter/search/sort against the full set, not necessarily render it all at once).

## Coin balance: precomputed + stored, not calculated per-request
**Decision:** The coin balance lives in a single-row `coin_balance` table, recalculated by a script that scans all `SUCCESS` transactions (1 coin per ₹100 spent, capped at 50 coins per transaction) and updates the row, rather than being computed live on every `/api/balance` call.
**Why:** Computing the balance live by summing 10k transactions on every request is wasteful once redeem/balance calls become frequent, and it makes race conditions between "read balance" and "redeem" harder to reason about. A stored, row-locked balance (`SELECT ... FOR UPDATE`) is the more realistic pattern for a real payments/rewards system: reads are cheap, and writes (redemptions) are the only place that needs a lock. The recalculation script is idempotent and safe to re-run, which also makes it a reasonable one-time seeding step rather than a background job for this assignment's scope.

## Row-level locking on redeem
**Decision:** The redeem endpoint takes a row lock (`with_for_update()`) on the coin balance row before validating and updating it.
**Why:** Without a lock, two concurrent redeem requests could both read the same starting balance, both pass the "sufficient balance" check, and both deduct — leaving the balance more overdrawn than it should be. A row lock serializes redemptions against the balance, which is the minimum needed for correctness even in a small assignment scope.

## Chart library: Recharts
**Decision:** Used Recharts for the category spend chart rather than a hand-built SVG chart.
**Why:** The brief explicitly allows (and doesn't restrict) charting libraries — the "build it yourself" constraint applies only to the transactions table, not charts. Recharts gave a working, responsive, accessible bar chart with click events in far less time than a hand-rolled chart would, which matters given the time budget and the fact that grading weight is concentrated on the table, not the chart implementation.

## Design system: CSS custom properties + inline styles, no CSS framework
**Decision:** Design tokens (`tokens.css`) define colors, spacing, and type scale as CSS custom properties; components (Button, Card, Modal, Table) consume them via inline `style` objects rather than a utility framework like Tailwind or a CSS-in-JS library.
**Why:** This keeps the component system self-contained and dependency-free, which matters since the brief explicitly wants to see how components are structured and reused, not how well a third-party framework is configured. It also sidesteps any ambiguity about whether a given "component library" would run afoul of the hand-built-table constraint.

## State management: plain React state, no external library
**Decision:** Component state (filters, search, sort, pagination, modal open/close, redeem flow) is handled with `useState`/`useCallback`/`useEffect`, without Redux, Zustand, or React Query.
**Why:** The app's state is local to a couple of pages and doesn't need cross-component global state or complex caching — a data-fetching library would add setup overhead without a clear payoff at this scope. The one place state needs to cross component boundaries (coin balance updating in the header after a redeem elsewhere) is handled with a small custom event (`balance-updated`) rather than pulling in a state library just for that.

## Backend structure: routes / services / models separated
**Decision:** FastAPI backend is split into route handlers, a services layer (business logic, e.g. category spend aggregation, coin calculation), and SQLAlchemy models, rather than one file.
**Why:** Directly requested by the brief ("keep routes, business logic and data access reasonably separated"), and it keeps redeem validation logic testable and readable independent of the HTTP layer.

## Hosting stack: Netlify (frontend) + Render (backend) + Neon (Postgres), all free tier
**Decision:** Frontend on Netlify, backend on Render, database on Neon.
**Why:** All three are explicitly suggested vendors in the brief and have workable free tiers. Neon was chosen over Render's own free Postgres offering because Render's free Postgres instances expire after a fixed period, which would silently break the deployed app after the assignment window — Neon's free tier persists indefinitely (with compute auto-suspend on inactivity, not deletion).

## CORS: temporarily open, then locked to the real origin
**Decision:** CORS was set to `allow_origins=["*"]` (with `allow_credentials=False`, since wildcard origins and credentialed requests can't be combined per the CORS spec) during initial frontend/backend wiring, then locked to the exact deployed Netlify origin once that URL was known.
**Why:** The Netlify URL isn't known until after the frontend's first deploy, so a wildcard is the pragmatic way to unblock testing; leaving it wildcarded in the final submission would be an unnecessary security gap for no remaining benefit once the real origin is known.
