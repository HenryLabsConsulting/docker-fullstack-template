"""
WSGI entry point for Gunicorn (production) and Flask CLI (development).

Production usage:
  gunicorn wsgi:app --bind 0.0.0.0:5000 --workers 4

Development usage (via docker-compose):
  flask run --host=0.0.0.0 --port=5000
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
