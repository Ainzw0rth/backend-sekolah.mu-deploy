FROM node
WORKDIR /app

COPY . /app

RUN npm install
RUN npm install --save-dev nodemon ts-node

EXPOSE 3000

CMD npm run startdev