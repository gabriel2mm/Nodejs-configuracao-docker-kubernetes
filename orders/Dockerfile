FROM node:10.4.1

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package*.json ./

RUN npm install --unsafe-perm --allow-root

COPY . .

EXPOSE 8081

CMD ["npm", "start"]