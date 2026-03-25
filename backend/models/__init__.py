"""
Model registry.

Import all models here so that:
  1. Alembic can detect them for auto-migrations
  2. Other modules can do: from models import User, Item
"""

from .user import User
from .item import Item

__all__ = ['User', 'Item']
