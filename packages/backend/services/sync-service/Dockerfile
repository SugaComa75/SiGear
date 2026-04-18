FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages/backend/services/sync-service/package.json ./packages/backend/services/sync-service/package.json
RUN npm install
COPY packages/backend/services/sync-service ./packages/backend/services/sync-service
WORKDIR /app/packages/backend/services/sync-service
RUN npm run build
CMD ["node", "dist/index.js"]