from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, List


class CategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TransactionOut(BaseModel):
    id: str
    timestamp: datetime
    merchant: str
    category: CategoryOut
    amount: Decimal
    currency: str
    status: str
    payment_method: str

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[TransactionOut]


class RewardOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    cost_in_coins: int
    is_active: bool

    class Config:
        from_attributes = True


class BalanceOut(BaseModel):
    balance: int


class RedeemRequest(BaseModel):
    reward_id: int = Field(..., gt=0)


class RedeemResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
