"""
Flask extension instances.

Extensions are instantiated here — separate from the app factory — to
prevent circular imports. The app factory calls ext.init_app(app) for
each one during create_app().

To add a new extension:
  1. Import and instantiate it here
  2. Call ext.init_app(app) in app.py's create_app()
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
bcrypt = Bcrypt()
