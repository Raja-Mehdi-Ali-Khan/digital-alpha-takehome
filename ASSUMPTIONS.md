# Assumptions

Places where the brief was intentionally open-ended, and the product call made:

## Coin earning rules
- **1 coin per ₹100 spent**, as stated in the brief, applied only to transactions with status `SUCCESS`. Failed and pending transactions do not earn coins.
- **Cap of 50 coins per transaction.** The brief says "capped per transaction" without specifying the cap value — 50 was chosen as a round number that meaningfully limits reward accrual on very large single transactions without being so low that it feels arbitrary on everyday purchases.
- Coin amounts are floored (not rounded) per ₹100 of spend, to avoid rewarding partial ₹100 increments.

## Rewards catalogue
- A fixed catalogue of **6 rewards** was defined (mix of cashback and voucher-style items, with varying coin costs), sitting within the "4 to 6 items" range the brief asked for.
- Rewards are treated as a static, seeded catalogue rather than something users can create or modify — the brief only asks for a catalogue to redeem against, not catalogue management.

## Single-user model
- The app assumes a **single implicit user** — there's one coin balance and one transaction history, with no login/auth flow. The brief's scope (a personal transactions/rewards dashboard) doesn't call for multi-user support, and adding auth would take time away from the graded core (table, charts, rewards) without being a stated requirement.

## Redeem flow behavior
- Redemption is **synchronous and immediate** — selecting a reward, confirming, and seeing the balance update happen in a single request/response cycle, with no pending/approval state. The brief describes the flow as "select, confirm, done," which reads as intentionally simple rather than needing an async or multi-step approval process.
- A failed redeem (insufficient balance, or a reward ID that doesn't exist) leaves the stored balance completely untouched — the backend validates before any deduction happens, rather than deducting and rolling back.

## Transaction categories
- Categories were taken as-is from the provided `transactions.json` dataset (e.g. Groceries, Food & Dining, Travel, Health, Insurance, Education, Shopping, Entertainment, Utilities, Fuel, Uncategorized) rather than being redefined or consolidated into a smaller custom taxonomy, since the brief doesn't ask for category redesign.

## Table interaction: pagination over infinite scroll or virtualization
- Chose numbered pagination (20 rows/page) as the primary browsing pattern for the transactions table, rather than infinite scroll or a virtualized single long list. The brief explicitly leaves this choice open ("pagination or virtualization is up to you"); pagination was judged easier to combine cleanly with filter/search/sort state and simpler to keep predictable across page loads.

## Chart interaction: one-way filtering (chart → table) for the core requirement
- Implemented the minimum required interaction (clicking a chart segment filters the table) as **one-way** for the Tier 1 core, matching the brief's stated minimum. Two-way cross-filtering (table filters also reshaping the chart) was treated as the explicitly-labeled "nice to have," not part of the core scope.

## Detail view: modal rather than drawer
- Row click opens a **modal** (not a side drawer) for transaction detail, since the brief states either is acceptable ("a drawer or a modal, your call") and a modal was faster to build consistently with the hand-built Modal component already used for the redeem confirmation flow.
