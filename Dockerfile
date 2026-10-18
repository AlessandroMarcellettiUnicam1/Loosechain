FROM node:20-alpine

RUN apk add --no-cache util-linux python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 9013 8545

CMD ["npm", "run", "docker:start"]
