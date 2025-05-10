FROM node:16-alpine
WORKDIR /app
COPY . .
RUN cd backend && npm install
CMD ["node", "backend/server.js"]
