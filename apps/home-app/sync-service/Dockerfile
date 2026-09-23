FROM node:20-alpine
WORKDIR /app/apps/home-app/sync-service
COPY apps/home-app/sync-service/package*.json ./
RUN npm install
COPY tsconfig.base.json /app/tsconfig.base.json
COPY apps/home-app/sync-service ./
RUN npm run build
CMD ["node", "dist/index.js"]
