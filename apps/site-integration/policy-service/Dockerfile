FROM node:20-alpine
WORKDIR /app/apps/site-integration/policy-service
COPY apps/site-integration/policy-service/package*.json ./
RUN npm install
COPY tsconfig.base.json /app/tsconfig.base.json
COPY apps/site-integration/policy-service ./
RUN npm run build
CMD ["node", "dist/index.js"]
