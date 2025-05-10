FROM node:16-alpine
WORKDIR /app
COPY . .
RUN cd backend && npm install
WORKDIR /app/backend
CMD ["node", "server.js"]
