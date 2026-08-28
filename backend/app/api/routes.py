from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.schemas import (
    TransactionListResponse, TransactionOut, CategoryOut,
    BalanceOut, RewardOut, RedeemRequest, RedeemResponse
)
from app.services.transactions import get_transactions, get_balance, get_rewards, redeem_reward

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/transactions", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    min_amount: Optional[Decimal] = None,
    max_amount: Optional[Decimal] = None,
    sort_by: str = Query("timestamp", pattern="^(timestamp|amount)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be on or before end_date")
    if min_amount is not None and max_amount is not None and min_amount > max_amount:
        raise HTTPException(status_code=400, detail="min_amount must be less than or equal to max_amount")

    total, items = get_transactions(
        db, page, page_size, category, status, search, sort_by, sort_order,
        start_date, end_date, min_amount, max_amount
    )
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items
    }


@router.get("/balance", response_model=BalanceOut)
def balance(db: Session = Depends(get_db)):
    return {"balance": get_balance(db)}


@router.get("/rewards", response_model=list[RewardOut])
def rewards(db: Session = Depends(get_db)):
    return get_rewards(db)


@router.post("/redeem", response_model=RedeemResponse)
def redeem(payload: RedeemRequest, db: Session = Depends(get_db)):
    return redeem_reward(db, payload)

@router.get("/analytics/categories")
def category_analytics(db: Session = Depends(get_db)):
    from app.services.transactions import get_category_spend
    return get_category_spend(db)


@router.get("/analytics/monthly")
def monthly_analytics(db: Session = Depends(get_db)):
    from app.services.transactions import get_monthly_spend
    return get_monthly_spend(db)