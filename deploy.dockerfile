
FROM node:10-alpine

RUN apk update
RUN apk add git
RUN npm install -g firebase-tools

RUN mkdir mount
WORKDIR /mount

ENV FIREBASE_PROJECT="dummy"
ENV FIREBASE_TOKEN="DUMMY"

CMD cd functions && npm install && cd ../ \
  && firebase use ${FIREBASE_PROJECT} --token ${FIREBASE_TOKEN} \
  && firebase deploy --token ${FIREBASE_TOKEN}
