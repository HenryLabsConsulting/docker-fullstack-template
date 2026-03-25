"""
Flask application factory.

WHY factory pattern: allows creating multiple app instances (for testing),
keeps configuration separate from instantiation, and prevents circular
imports by deferring extension initialization.

To add a new feature:
  1. Create a model in models/
  2. Create a blueprint in routes/
  3. Register the blueprint below
  4. Run: flask db migrate -m "description"
  5. Run: flask db upgrade
"""

from flask import Flask
from config import Config
from extensions import db, migrate, jwt, cors, bcrypt


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # CORS: allow frontend origins. In production, restrict to your domain.
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config.get(
                'CORS_ORIGINS',
                'http://localhost:5173'
            ).split(',') if isinstance(
                app.config.get('CORS_ORIGINS'), str
            ) else ["http://localhost:5173"]
        }
    })

    # Import models so Alembic can detect them for auto-migrations
    import models  # noqa: F401

    # --- Register blueprints ---
    # Each blueprint is a self-contained module with its own routes.
    # Add your own blueprints here following the same pattern.

    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from routes.items import items_bp
    app.register_blueprint(items_bp)

    # --- Health check ---
    # Used by Docker health checks and CI/CD deploy verification.
    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    return app
