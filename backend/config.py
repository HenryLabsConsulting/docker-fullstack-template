"""
Application configuration.

All config is read from environment variables so the same code runs in
dev, staging, and production without changes. Defaults are provided for
local development — override them in .env or your deployment environment.

To add a new environment (e.g., staging):
  1. Create a new class inheriting from Config
  2. Override the values that differ
  3. Set FLASK_ENV=staging in your environment
"""

import os
from datetime import timedelta


class Config:
    # --- Core Flask ---
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key')

    # --- Database ---
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://myapp_user:change_me_to_a_strong_password@localhost:5432/myapp_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- JWT Authentication ---
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # --- Upload limits ---
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25MB
