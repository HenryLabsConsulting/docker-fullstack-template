"""Initial schema: users and items tables.

Revision ID: 001_initial
Revises: None
Create Date: 2026-03-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Users table — authentication and ownership
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(255), server_default=''),
        sa.Column('role', sa.String(50), server_default='user'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )

    # Items table — example CRUD resource
    op.create_table(
        'items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(50), server_default='active'),
        sa.Column('owner_id', sa.Integer(),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )

    # Indexes for common query patterns
    op.create_index('idx_items_owner_id', 'items', ['owner_id'])
    op.create_index('idx_items_status', 'items', ['status'])


def downgrade():
    op.drop_index('idx_items_status', table_name='items')
    op.drop_index('idx_items_owner_id', table_name='items')
    op.drop_table('items')
    op.drop_table('users')
