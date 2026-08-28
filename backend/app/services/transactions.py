from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.models import Transaction, Category, Reward, CoinBalance, Redemption
from app.models.schemas import RedeemRequest


def get_transactions(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    category: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    start_date: date | None = None,
    end_date: date | None = None,
    min_amount: Decimal | None = None,
    max_amount: Decimal | None = None,
):
    query = db.query(Transaction).options(joinedload(Transaction.category))

    if category:
        query = query.join(Category).filter(Category.name.ilike(f"%{category}%"))
    if status_filter:
        query = query.filter(Transaction.status == status_filter.upper())
    if search:
        query = query.filter(Transaction.merchant.ilike(f"%{search}%"))
    if start_date:
        query = query.filter(Transaction.timestamp >= datetime.combine(start_date, time.min, tzinfo=timezone.utc))
    if end_date:
        next_day = end_date + timedelta(days=1)
        query = query.filter(Transaction.timestamp < datetime.combine(next_day, time.min, tzinfo=timezone.utc))
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    total = query.count()

    # Sorting
    sort_column = Transaction.timestamp if sort_by == "timestamp" else Transaction.amount
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return total, items


def get_balance(db: Session) -> int:
    row = db.query(CoinBalance).first()
    return row.balance if row else 0


def get_rewards(db: Session):
    return db.query(Reward).filter(Reward.is_active == True).all()


def redeem_reward(db: Session, payload: RedeemRequest):
    reward = db.query(Reward).filter(Reward.id == payload.reward_id, Reward.is_active == True).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found or inactive"
        )

    balance_row = db.query(CoinBalance).with_for_update().first()
    if not balance_row:
        raise HTTPException(status_code=500, detail="Coin balance not initialized")

    if balance_row.balance < reward.cost_in_coins:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Need {reward.cost_in_coins}, have {balance_row.balance}"
        )

    # Deduct and record
    balance_row.balance -= reward.cost_in_coins
    redemption = Redemption(reward_id=reward.id, coins_spent=reward.cost_in_coins)
    db.add(redemption)
    try:
        db.commit()
        db.refresh(balance_row)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to complete redemption")

    return {
        "success": True,
        "message": f"Successfully redeemed {reward.name}",
        "new_balance": balance_row.balance
    }

def get_category_spend(db: Session):
    from sqlalchemy import func
    from app.models.models import Transaction, Category

    results = (
        db.query(
            Category.name,
            func.sum(Transaction.amount).label("total")
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(Transaction.status == "SUCCESS")
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [{"category": r.name, "total": float(r.total)} for r in results]


def get_monthly_spend(db: Session):
    results = (
        db.query(
            func.to_char(func.date_trunc("month", Transaction.timestamp), "YYYY-MM").label("month"),
            func.sum(Transaction.amount).label("total"),
        )
        .filter(Transaction.status == "SUCCESS")
        .group_by(func.date_trunc("month", Transaction.timestamp))
        .order_by(func.date_trunc("month", Transaction.timestamp))
        .all()
    )
    return [{"month": row.month, "total": float(row.total)} for row in results]