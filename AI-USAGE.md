# AI Usage

## Tools used

- **An AI coding assistant** (chat-based) was used throughout the build — for scaffolding the backend (FastAPI routes/services/models), the frontend (Next.js + TypeScript, design tokens, Button/Card/Modal/Table components, Transactions page, Rewards page, category chart), the coin-balance calculation script, and for deployment guidance (Neon, Render, Netlify).
- Usage was heaviest in: initial scaffolding of boilerplate (design tokens, component shells, API client), debugging build/runtime errors, and step-by-step deployment instructions.
- Usage was lightest in: final visual polish decisions and product-call decisions (reward catalogue contents, coin cap), which were reviewed and confirmed manually rather than taken as-is.

## Real examples of AI output that was thrown away or had to be fixed

**1. Multi-line PowerShell here-strings corrupted complex TSX code (thrown away, changed approach entirely)**
The AI's initial approach for creating `Table.tsx` and `page.tsx` was to generate the full file content and pipe it into a file via a PowerShell here-string (`@"..."@ | Out-File`). For files with template literals, curly braces, and special characters, PowerShell's parser mangled the content — variables got interpreted, backticks appeared where they shouldn't, and the resulting `.tsx` files had broken syntax (`Expected ','`, `got '{'` errors). This happened more than once. The fix was to abandon the here-string approach entirely for complex files: delete the broken file, create an empty one, and paste the code directly in an editor instead of via shell piping. This is a case where the AI's first instinct (do everything from the command line) was actively wrong for this file type and had to be corrected by switching workflows, not just fixing a typo.

**2. Recharts `onClick` handler — two failed type signatures before a working one**
When wiring up the category chart's click-to-filter behavior, the AI's first attempt (`onClick={(state) => { if (state && state.category) ... }}`) didn't compile — Recharts' `Bar` `onClick` event typing doesn't expose `category` directly on the event object the way that code assumed. The second attempt (`onClick={(data) => { if (data && data.category) ... }}`) still failed for the same underlying reason. Both were thrown away. The working fix used the click handler's index parameter to look up the clicked item from the component's own `data` array (`onClick={(_, index) => { const item = data[index]; ... }}`) instead of trusting Recharts to hand back the right shape. This is a good example of an AI-generated API-usage assumption that was simply wrong until verified against the actual library types.

**3. Tooltip `formatter` prop — untyped assumption caused a type error**
Similarly, the initial `Tooltip formatter` implementation assumed its `value` argument was always a `number` and called `.toLocaleString()` directly on it. Recharts types `value` more loosely, so this failed type-checking. Had to add a runtime type guard (`typeof value === "number"`) before formatting, discarding the naive first version.

**4. Wrong import path suggested for a component that had been reorganized**
The AI generated `import { Header } from "@/components/uiHeader";` in `layout.tsx`, but the actual project structure (per the user's own convention of keeping all UI pieces under `components/ui/`) put the file at a different path. This wasn't caught until the dev server threw a module-not-found error. Fixed by correcting the import to match the real file location. This is a case of the AI making a plausible-looking but factually wrong assumption about file layout instead of checking it.

**5. Backend build failure on Render — wrong root cause diagnosed correctly, but required a second attempt to identify**
Deploying the FastAPI backend to Render initially failed with a Rust/Cargo build error (`Read-only file system`) while installing `pydantic-core`. This wasn't a code bug — it was caused by Render's default Python version not having a prebuilt wheel for the pinned `pydantic`/`fastapi` versions, forcing a source (Rust) build that can't succeed in Render's sandboxed filesystem. The fix (pinning `PYTHON_VERSION=3.11.9` as an environment variable) worked, but only after correctly tracing the error through several layers (Cargo → crates.io → pydantic-core → Python version mismatch) rather than treating it as a simple dependency problem.

**6. CORS configuration that looked correct but violated the CORS spec**
An early CORS snippet combined `allow_origins=["*"]` with `allow_credentials=True`. This combination is invalid per the CORS specification and is silently rejected by browsers — it would have caused a confusing runtime failure later even though the code "looked" correct and would have passed a casual review. This was caught and corrected (`allow_credentials=False` while origins is wildcarded) before it caused a live bug, rather than after.

**7. Netlify "Publish directory" field misunderstood as a plain text input**
When setting up the Netlify frontend deploy, the AI first assumed the "Publish directory" field was a full, independent path and suggested changing `frontend/.next` to just `.next`. This was actually wrong — Netlify's UI locks the base-directory prefix and only lets you edit the suffix, so the original value shown (`frontend/.next`) was already correct. The AI's "correction" would have broken a working configuration; it had to be reversed once a screenshot showed the actual UI behavior. This is an example of AI advice being wrong because it reasoned about a UI it hadn't actually seen, and had to be corrected by the user showing what the interface really looked like.

## Where AI use required the most manual verification

- All TypeScript/Recharts typing issues were only resolved by iterating against real compiler errors, not by trusting the AI's first (or second) suggestion.
- Deployment configuration (Render build/start commands, Netlify base/publish directories, CORS origins) was verified against actual dashboard screenshots at every step rather than assumed correct from the AI's instructions alone.
- The coin-balance calculation logic (1 coin per ₹100, capped at 50/transaction, only on `SUCCESS` transactions) was specified by the product owner (the assumptions file) and implemented by the AI, but the resulting numbers were manually verified via direct API calls (`/api/balance`) before being trusted.
