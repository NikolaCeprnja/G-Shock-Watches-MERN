FROM node:14-slim

WORKDIR /usr/src

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./.eslintignore ./.gitignore ./.prettierignore ./.prettierrc lerna.json ./

RUN yarn install
