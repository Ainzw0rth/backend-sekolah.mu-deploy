FROM node
WORKDIR /app

COPY . /app

RUN npm install
RUN npm install -g nodemon ts-node

EXPOSE 3000

CMD npm run startdev