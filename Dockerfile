FROM node:20-alpine

WORKDIR /app

USER node

COPY --chown=node:node package.json package-lock.json* ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
