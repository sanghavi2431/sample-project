FROM node:18-alpine

WORKDIR /app

COPY package*.json .

COPY ./app ./app
COPY ./public ./public

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]