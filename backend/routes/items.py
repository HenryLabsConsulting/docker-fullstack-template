"""
Items CRUD routes — example resource endpoints.

Copy this pattern to create your own API endpoints:
  1. Create a new Blueprint
  2. Add @jwt_required() to protect routes
  3. Use get_jwt_identity() to scope data to the current user
  4. Return consistent JSON: {"data": ...} on success, {"error": ...} on failure
  5. Register the blueprint in app.py

All routes are owner-scoped: users can only see and modify their own items.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Item

items_bp = Blueprint('items', __name__, url_prefix='/api/items')


@items_bp.route('', methods=['GET'])
@jwt_required()
def list_items():
    """
    List items for the current user.

    Query parameters:
      - page (int, default 1): page number
      - per_page (int, default 20, max 100): items per page
      - status (str, optional): filter by status ("active" or "archived")
    """
    current_user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status = request.args.get('status')

    query = Item.query.filter_by(owner_id=current_user_id)
    if status:
        query = query.filter_by(status=status)

    query = query.order_by(Item.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'data': [item.to_dict() for item in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
        }
    }), 200


@items_bp.route('/<int:item_id>', methods=['GET'])
@jwt_required()
def get_item(item_id):
    """Get a single item. Returns 404 if not found or not owned by current user."""
    current_user_id = int(get_jwt_identity())
    item = Item.query.filter_by(id=item_id, owner_id=current_user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    return jsonify({'data': item.to_dict()}), 200


@items_bp.route('', methods=['POST'])
@jwt_required()
def create_item():
    """
    Create a new item. Owner is automatically set from the JWT token.

    Request body:
      - name (str, required): item name (max 200 chars)
      - description (str, optional): item description
      - status (str, optional): "active" (default) or "archived"
    """
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400

    if len(data['name']) > 200:
        return jsonify({'error': 'Name must be 200 characters or fewer'}), 400

    status = data.get('status', 'active')
    if status not in ('active', 'archived'):
        return jsonify({'error': 'Status must be "active" or "archived"'}), 400

    item = Item(
        name=data['name'],
        description=data.get('description', ''),
        status=status,
        owner_id=current_user_id,
    )
    db.session.add(item)
    db.session.commit()

    return jsonify({
        'data': item.to_dict(),
        'message': 'Item created'
    }), 201


@items_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    """
    Update an existing item. Only the owner can update.

    Request body (all optional):
      - name (str): item name
      - description (str): item description
      - status (str): "active" or "archived"
    """
    current_user_id = int(get_jwt_identity())
    item = Item.query.filter_by(id=item_id, owner_id=current_user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'name' in data:
        if not data['name']:
            return jsonify({'error': 'Name cannot be empty'}), 400
        if len(data['name']) > 200:
            return jsonify({'error': 'Name must be 200 characters or fewer'}), 400
        item.name = data['name']

    if 'description' in data:
        item.description = data['description']

    if 'status' in data:
        if data['status'] not in ('active', 'archived'):
            return jsonify({'error': 'Status must be "active" or "archived"'}), 400
        item.status = data['status']

    db.session.commit()

    return jsonify({
        'data': item.to_dict(),
        'message': 'Item updated'
    }), 200


@items_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """Delete an item. Only the owner can delete."""
    current_user_id = int(get_jwt_identity())
    item = Item.query.filter_by(id=item_id, owner_id=current_user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item deleted'}), 200
