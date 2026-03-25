FROM python:3.12-slim

WORKDIR /app

# Install dependencies first for better Docker layer caching.
# This layer only rebuilds when requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=wsgi.py

EXPOSE 5000

# Default command for development. Override in docker-compose for production.
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
