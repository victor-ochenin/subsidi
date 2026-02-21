FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && chown -R node:node /app

COPY --chown=node:node . .

RUN npm run build
ENV PORT=80

EXPOSE 80

CMD ["npm", "start"]
