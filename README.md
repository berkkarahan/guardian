# README #

Backend for METU SE-560 Software Development Studio Project

### Tech stack ###

* nodejs
* MongoDB(mongoose)
* nvm

# Routes
## auth
### login
POST body ->
````
{
    email
    password
}
````
response 
```
{
    jwt,
    user{
        username,
        email
    }
}
```
### logout
POST ->
Authorization bearer token required(jwt).
### signup
POST
```
{
    user {
        userName
        email
        password
    }
}
```
response 
```
{
    user
    verificationTokenUUID
}
```
### verification
POST
````
{
    email
    password
}
````
### password-reset
POST
````
{
    email
}
````
response 
```
{
    token_uuid
}
```
### password-reset-callback
POST ->
uuid of the token created from passwword-reset endpoint.
```
{
    uuid
    password
}
```
### session
GET -> Authorization bearer token required(jwt).
## user
### profile
GET -> Authorization bearer token required(jwt).
response 
```
{
    data {
        username
        email
        createdAt
    }
}
```
### details
GET -> Authorization bearer token required(jwt).
response 
```
{
    userJson
}
```
### update
POST -> Authorization bearer token required(jwt).
```
{
    <user model properties>
}
```
response 
```
{
    userJson
}
```
### deactivate
POST -> Authorization bearer token required(jwt).
## company
### comment/all
### comment/create
### comment/update
### comment/delete
### cities/'companyUUID''
### top
### 'companyUUID'
### all
 
