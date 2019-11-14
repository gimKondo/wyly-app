# wyly-app
## Summary
Backend of Wyly on Firebase.

## Requirement
- docker
- firebase CLI

## Setup
- define environment variable `WYLY_APP_FIREBASE_TOKEN_DEV`
  - get firebase token by `firebase login:ci`
  - set token to environment variable
    - `export WYLY_APP_FIREBASE_TOKEN_DEV=1/xxxxxxxxx`

## Deploy
- execute `docker-compose -f ./deploy-dev-compose.yml up`
  - 1st time, use `docker-compose -f ./deploy-dev-compose.yml up --build` for building docker
