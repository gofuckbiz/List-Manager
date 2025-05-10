FROM node:16-alpine


WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./


WORKDIR /app/frontend
COPY frontend/ ./




WORKDIR /app/backend
CMD ["node", "server.js"]
