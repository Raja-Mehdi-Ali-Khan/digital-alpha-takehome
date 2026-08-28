# Technical Decisions

## Database Schema
- Normalized categories into a separate categories table instead of storing the string on every transaction.
- Used Numeric(12,2) for amounts to avoid floating-point issues with money.
- Kept a simple single-row coin_balance table (single-user app for this assignment).
- Added edemptions table so we have an audit trail of reward claims.
- Why: Real relational design is required by the brief; dumping JSON into one column was explicitly disallowed.

## Seed Script Data Cleaning
- 50 records were missing the category key → mapped to "Uncategorized".
- Timestamps came in three formats (ISO with Z, ISO with offset, Unix ms, and DD/MM/YYYY HH:MM:SS) → used a robust parser with python-dateutil fallback.
- Dataset contained 40 duplicate transaction IDs → kept the first occurrence of each ID (primary key must be unique).
- Why: The brief hints that the dataset has quirks; handling them cleanly is part of the evaluation.

## Pagination vs Virtualization (to be decided later)
- Will be decided when building the transactions table (Tier 1 priority).
