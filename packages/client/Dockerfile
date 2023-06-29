FROM node:14-slim

WORKDIR /usr/src/app

ENV PATH /usr/src/node_modules/.bin:/usr/src/app/node_modules/.bin:$PATH

COPY ./packages/client/package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY ./packages/client .

EXPOSE 3000

CMD ["yarn", "start"]
