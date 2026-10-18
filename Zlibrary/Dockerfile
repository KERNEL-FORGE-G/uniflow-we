FROM node:22-alpine

WORKDIR /app

# Dépendances de production
COPY package*.json ./
RUN npm install --production

# Code source
COPY . .

ENV PORT=7070
EXPOSE 7070

CMD ["node", "server.js"]
