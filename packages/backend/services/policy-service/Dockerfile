FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages/backend/services/policy-service/package.json ./packages/backend/services/policy-service/package.json
RUN npm install
COPY packages/backend/services/policy-service ./packages/backend/services/policy-service
WORKDIR /app/packages/backend/services/policy-service
RUN npm run build
CMD ["node", "dist/index.js"]