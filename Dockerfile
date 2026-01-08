FROM node:20-alpine
RUN apk add --no-cache util-linux
WORKDIR home
COPY . .
RUN npm install
EXPOSE 9013
CMD ["npm", "run", "dev"]
