"""
Database seeder — creates demo users and sample items.

Usage:
  docker compose exec backend python seed.py

Safe to run multiple times — checks for existing data before inserting.

Default accounts:
  admin@example.com / admin123  (admin role)
  user@example.com  / user123   (user role)
"""

from app import create_app
from extensions import db
from models import User, Item

app = create_app()

with app.app_context():
    # Idempotent: skip if already seeded
    if User.query.filter_by(email='admin@example.com').first():
        print('Database already seeded. Skipping.')
        print('To re-seed, drop the database and run migrations first.')
        exit(0)

    # --- Users ---
    admin = User(
        email='admin@example.com',
        display_name='Admin User',
        role='admin',
    )
    admin.set_password('admin123')

    regular = User(
        email='user@example.com',
        display_name='Regular User',
        role='user',
    )
    regular.set_password('user123')

    db.session.add_all([admin, regular])
    db.session.flush()  # Get IDs before creating items

    # --- Items (admin-owned) ---
    admin_items = [
        Item(
            name='Server Migration Plan',
            description='Migrate legacy services to containerized infrastructure',
            status='active',
            owner_id=admin.id,
        ),
        Item(
            name='Q2 Budget Review',
            description='Review quarterly spending against department forecasts',
            status='active',
            owner_id=admin.id,
        ),
        Item(
            name='API Documentation',
            description='Document REST endpoints for partner integration',
            status='active',
            owner_id=admin.id,
        ),
        Item(
            name='Onboarding Checklist',
            description='New hire onboarding process and required training',
            status='archived',
            owner_id=admin.id,
        ),
        Item(
            name='Security Audit Findings',
            description='Address findings from annual penetration test',
            status='active',
            owner_id=admin.id,
        ),
    ]

    # --- Items (user-owned) ---
    user_items = [
        Item(
            name='Weekly Team Standup Notes',
            description='Recurring meeting notes and action items',
            status='active',
            owner_id=regular.id,
        ),
        Item(
            name='Vendor Evaluation',
            description='Compare SaaS vendors for project management tooling',
            status='active',
            owner_id=regular.id,
        ),
        Item(
            name='Office Supply Order',
            description='Quarterly supply request for engineering floor',
            status='archived',
            owner_id=regular.id,
        ),
    ]

    db.session.add_all(admin_items + user_items)
    db.session.commit()

    print(f'Seeded: 2 users, {len(admin_items) + len(user_items)} items')
    print(f'  Admin: admin@example.com / admin123')
    print(f'  User:  user@example.com / user123')
