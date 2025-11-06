FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install to avoid lockfile sync failures during local iteration
# (ci requires lockfile to be in sync).
RUN npm install --include=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node","dist/src/server.js"]
