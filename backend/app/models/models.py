from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    merchant = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    status = Column(String(20), nullable=False, index=True)          # SUCCESS / FAILED
    payment_method = Column(String(50), nullable=False)

    category = relationship("Category", back_populates="transactions")


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    cost_in_coins = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)


class CoinBalance(Base):
    __tablename__ = "coin_balance"

    id = Column(Integer, primary_key=True)
    balance = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    reward_id = Column(Integer, ForeignKey("rewards.id"), nullable=False)
    coins_spent = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    reward = relationship("Reward")
