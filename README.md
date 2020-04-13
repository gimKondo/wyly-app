# wyly-app

## Summary

Backend of Wyly on Firebase.

## Requirement

- docker
- firebase CLI

## Setup

- define environment variable `WYLY_APP_FIREBASE_TOKEN_XXX`
  - get firebase token by `firebase login:ci`
    - for dev: `firebase use develop` before get token
    - for stage: `firebase use stage` before get token
  - set token to environment variable
    - for dev: `export WYLY_APP_FIREBASE_TOKEN_DEV=1/xxxxxxxxx`
    - for stage: `export WYLY_APP_FIREBASE_TOKEN_STAGE=1/xxxxxxxxx`

## Deploy

- execute `docker-compose -f ./deploy-xxx-compose.yml run deploy`
  - 1st time, use `docker-compose -f ./deploy-xxx-compose.yml build` for building docker

<<<<<<< HEAD
## Firestore

### update indexes by console setting

- execute  `docker-compose -f ./deploy-xxx-compose.yml run deploy sh -c 'firebase firestore:indexes --project $FIREBASE_PROJECT'>firestore.indexes.json`
=======
>>>>>>> dev
