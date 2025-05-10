
FROM node:18-alpine as build


WORKDIR /app

# Копирование package.json файлов
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/


RUN cd frontend && npm install
RUN cd backend && npm install

# Копирование исходного кода
COPY . .

# Сборка фронтенда
RUN cd frontend && npm run build

# Запуск бэкенда с фронтендом
CMD ["node", "backend/server.js"]
