import sys
from pathlib import Path
from decimal import Decimal, ROUND_DOWN
from sqlalchemy import func

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import SessionLocal
from app.models.models import Transaction, CoinBalance

def calculate_and_set_balance():
    db = SessionLocal()
    try:
        # Only SUCCESS transactions count
        rows = (
            db.query(Transaction.amount)
            .filter(Transaction.status == "SUCCESS")
            .all()
        )

        total_coins = 0
        for (amount,) in rows:
            if amount <= 0:
                continue
            # 1 coin per ₹100, floor, then cap at 50
            coins = int((Decimal(str(amount)) // 100).to_integral_value(rounding=ROUND_DOWN))
            coins = min(coins, 50)
            total_coins += coins

        balance_row = db.query(CoinBalance).with_for_update().first()
        if not balance_row:
            balance_row = CoinBalance(id=1, balance=0)
            db.add(balance_row)

        old = balance_row.balance
        balance_row.balance = total_coins
        db.commit()

        print(f"SUCCESS transactions processed: {len(rows)}")
        print(f"Old balance : {old}")
        print(f"New balance : {total_coins}")
        print("COIN BALANCE UPDATED")
    except Exception as e:
        db.rollback()
        print("ERROR:", e)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    calculate_and_set_balance()
