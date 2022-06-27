FROM node:18.4-alpine3.15 AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

FROM node:18.4-alpine3.15
USER node:node
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app/build build/
COPY --from=builder --chown=node:node /app/node_modules node_modules/
COPY --chown=node:node  package.json .
EXPOSE 3000
CMD [ "node", "build" ]
