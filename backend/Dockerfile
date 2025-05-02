FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 

COPY . .

RUN mkdir -p logs uploads public/images/banner && \
    chown -R node:node logs uploads public/images/banner

EXPOSE 8000

USER node

CMD ["npm", "run", "prod"]