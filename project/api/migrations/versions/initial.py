"""Initial migration

Revision ID: initial
Revises: 
Create Date: 2024-03-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('auth0_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('auth0_id')
    )

    # Create predictions table
    op.create_table(
        'predictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('appliances', postgresql.JSON(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('consumption', sa.Float(), nullable=False),
        sa.Column('days', sa.Integer(), nullable=False),
        sa.Column('total_appliances', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    # Create forecasts table
    op.create_table(
        'forecasts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('prediction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('predictions.id')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('consumption', sa.Float(), nullable=False),
        sa.Column('trend', sa.String(), nullable=False),
        sa.Column('percentage_change', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )

def downgrade() -> None:
    op.drop_table('forecasts')
    op.drop_table('predictions')
    op.drop_table('users')