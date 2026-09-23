FROM node:20-alpine
WORKDIR /app/apps/identity-and-minting/service
COPY apps/identity-and-minting/service/package*.json ./
RUN npm install
COPY tsconfig.base.json /app/tsconfig.base.json
COPY apps/identity-and-minting/service ./
RUN npm run build
CMD ["node", "dist/index.js"]
