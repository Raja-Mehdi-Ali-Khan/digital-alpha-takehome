from sqlalchemy.orm import Session, joinedload
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
):
    query = db.query(Transaction).options(joinedload(Transaction.category))

    if category:
        query = query.join(Category).filter(Category.name.ilike(f"%{category}%"))
    if status_filter:
        query = query.filter(Transaction.status == status_filter.upper())
    if search:
        query = query.filter(Transaction.merchant.ilike(f"%{search}%"))

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
    db.commit()
    db.refresh(balance_row)

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