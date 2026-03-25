"""
User model with bcrypt password hashing.

Pattern notes:
  - Password is never stored in plain text. set_password() hashes it,
    check_password() compares against the hash.
  - display_name is optional — email is the login identifier.
  - role field supports basic RBAC ("admin" vs "user"). Extend with
    additional roles as needed.
  - to_dict() excludes password_hash — never expose hashes to the API.
"""

from extensions import db, bcrypt
from datetime import datetime, timezone


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(255), default='')
    role = db.Column(db.String(50), default='user')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        """Hash and store a plain-text password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verify a plain-text password against the stored hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'display_name': self.display_name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
