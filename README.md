# wyly-app
## Summary
Backend of Wyly on Firebase.

## Requirement
- docker
- firebase CLI

## Setup
- setup `deploy-dev.env`
  - get firebase token by `firebase login:ci`
  - create `deploy-dev.env` file on project root, and write token.
    - `FIREBASE_TOKEN=1/xxxxxxxxx`

## Deploy
- execute `docker-compose -f ./deploy-dev-compose.yml up`
  - 1st time, use `docker-compose -f ./deploy-dev-compose.yml up --build` for building docker
