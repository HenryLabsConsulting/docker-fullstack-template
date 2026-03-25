FROM node:20-slim

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

# Vite dev server — host flag makes it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
