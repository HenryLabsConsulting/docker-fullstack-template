"""
Item model — example CRUD resource.

Copy this pattern to create your own models:
  1. Define columns with appropriate types and constraints
  2. Add a foreign key to users for ownership
  3. Include created_at/updated_at timestamps
  4. Write a to_dict() method for API serialization
  5. Register the model in models/__init__.py
  6. Run: flask db migrate -m "add your_model table"
  7. Run: flask db upgrade
"""

from extensions import db
from datetime import datetime, timezone


class Item(db.Model):
    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='active')  # active, archived
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    owner = db.relationship('User', backref=db.backref('items', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
