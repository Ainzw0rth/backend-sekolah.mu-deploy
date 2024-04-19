FROM node
WORKDIR /app

COPY . /app

ENV NODE_ENV=development

RUN npm install
RUN npm install --save-dev nodemon ts-node

EXPOSE 3000

CMD npm run startdev