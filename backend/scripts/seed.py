import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from decimal import Decimal, ROUND_DOWN
from dateutil import parser as date_parser

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import engine, SessionLocal, init_db
from app.models.models import Category, Transaction, Reward, CoinBalance, Redemption

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "transactions.json"


def parse_timestamp(value):
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc)
    if isinstance(value, str):
        try:
            if value.endswith("Z"):
                value = value[:-1] + "+00:00"
            parsed = datetime.fromisoformat(value)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except ValueError:
            dt = date_parser.parse(value)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
    raise ValueError(f"Cannot parse timestamp: {value}")


def seed():
    print("Creating tables...")
    init_db()

    db = SessionLocal()
    try:
        print("Clearing old data...")
        db.query(Redemption).delete()
        db.query(Transaction).delete()
        db.query(Category).delete()
        db.query(Reward).delete()
        db.query(CoinBalance).delete()
        db.commit()

        print(f"Loading {DATA_FILE}...")
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)

        print(f"Found {len(raw)} raw records")

        # Deduplicate by id (keep first occurrence)
        seen = set()
        unique_rows = []
        for row in raw:
            tid = row.get("id")
            if tid and tid not in seen:
                seen.add(tid)
                unique_rows.append(row)

        print(f"After deduplication: {len(unique_rows)} unique transactions")

        # Categories
        category_map = {}
        for row in unique_rows:
            cat_name = row.get("category")
            if not cat_name or not str(cat_name).strip():
                cat_name = "Uncategorized"
            else:
                cat_name = str(cat_name).strip()
            if cat_name not in category_map:
                category_map[cat_name] = Category(name=cat_name)

        db.add_all(category_map.values())
        db.flush()
        cat_id_lookup = {c.name: c.id for c in category_map.values()}

        batch = []
        for i, row in enumerate(unique_rows, 1):
            cat_name = row.get("category")
            if not cat_name or not str(cat_name).strip():
                cat_name = "Uncategorized"
            else:
                cat_name = str(cat_name).strip()

            txn = Transaction(
                id=row["id"],
                timestamp=parse_timestamp(row["timestamp"]),
                merchant=row["merchant"],
                category_id=cat_id_lookup[cat_name],
                amount=Decimal(str(row["amount"])),
                currency=row.get("currency", "INR"),
                status=row["status"],
                payment_method=row["payment_method"],
            )
            batch.append(txn)

            if len(batch) >= 1000:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []
                print(f"  inserted {i} rows...")

        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        print(f"Inserted {len(unique_rows)} transactions")

        rewards = [
            Reward(name="₹100 Amazon Voucher", description="Amazon.in gift card", cost_in_coins=50),
            Reward(name="₹250 Flipkart Voucher", description="Flipkart gift card", cost_in_coins=120),
            Reward(name="Movie Ticket", description="BookMyShow voucher for 1 ticket", cost_in_coins=80),
            Reward(name="₹50 Cashback", description="Direct cashback to bank", cost_in_coins=30),
            Reward(name="Swiggy ₹150", description="Swiggy food voucher", cost_in_coins=70),
            Reward(name="Premium Lounge Access", description="Airport lounge access (1 visit)", cost_in_coins=200),
        ]
        db.add_all(rewards)
        initial_balance = 0
        for row in unique_rows:
            amount = Decimal(str(row["amount"]))
            if str(row["status"]).upper() == "SUCCESS" and amount > 0:
                initial_balance += min(int((amount // 100).to_integral_value(rounding=ROUND_DOWN)), 50)
        db.add(CoinBalance(id=1, balance=initial_balance))
        db.commit()

        print(f"Rewards and coin balance seeded ({initial_balance:,} coins).")
        print("SEED COMPLETE")

    except Exception as e:
        db.rollback()
        print("ERROR:", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
