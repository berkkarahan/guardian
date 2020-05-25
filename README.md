# README #

Backend for METU SE-560 Software Development Studio Project

### Tech stack ###

* nodejs
* nvm
* MongoDB(mongoose)
* expressjs
* jsonwebtoken
* babel for transpiling to vanilla js.

# Building the backend
## Commands
- git clone
- nvm i && nvm use
- npm i
- npm start

## Necessary env variables
- PORT=9999 for local port.
- NODE_ENV for local dev envs.
- MONGODB_URI for mongodb connection string.
- MONGODB_URI_TEST for test mongodb.
- COOKIE_SECRET for admin panel's cookie signer.
- JWT_SECRET for auth system's signer.
- JWT_ISSUER for auth system as issuer.
- JWT_EXPIRESIN for expiration ex. 1h
- FE_URL for redirecting to frontend.
- ADMIN_USERNAME for static admin username.
- ADMIN_PWD for static admin pwd.
- SENDER_EMAIL for sender email.
- SENDER_PWD for sender password.


# Routes
[Routes ReadMe](https://github.com/berkkarahan/guardian/tree/master/src/routes)