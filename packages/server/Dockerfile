FROM node:14-slim

WORKDIR /usr/src/app

ENV PATH /usr/src/node_modules/.bin:/usr/src/app/node_modules/.bin:$PATH

COPY ./packages/server/package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY ./packages/server .

EXPOSE 5000

CMD ["yarn", "server"]
