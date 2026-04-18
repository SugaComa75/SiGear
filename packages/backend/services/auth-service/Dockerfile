FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages/backend/services/auth-service/package.json ./packages/backend/services/auth-service/package.json
RUN npm install
COPY packages/backend/services/auth-service ./packages/backend/services/auth-service
WORKDIR /app/packages/backend/services/auth-service
RUN npm run build
CMD ["node", "dist/index.js"]