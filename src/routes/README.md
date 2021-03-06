# Routes Readme
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
## companies
### comment/all
POST -> Authorization bearer token is optional(jwt).
```
{
    filters {
        query {
            companyUUID
        }
        pageNumber
    }
}
```
response 
```
{
    uuid
    comment
    canUserEdit
    user {
        ...
    }
}
```
### comment/create
POST -> Authorization bearer token is optional(jwt).
```
{
    commentBody
    companyUUID
}
```
response 
```
{
    companyCommentUUID
}
```
### comment/update
POST -> Authorization bearer token is optional(jwt).
```
{
    commentBody
    commentUUID
}
```
### comment/delete
POST -> Authorization bearer token is optional(jwt).
```
{
    commentUUID
}
```
### cities/'companyUUID'
GET -> request companyUUID as URL parameneter.
### top
### 'companyUUID'
GET -> request companyUUID as URL parameneter.
response 
```
{
    <company details>
}
```
### all
POST ->
```
{
    filters {
        query {
            name
        }
        pageNumber
    }
}
```
response 
```
{
    uuid
    title
    averageRating
    reviewCount
    information {
        petAllowed
        is3Seater
    }
}
```
## travelslots
### cities
GET -> request
### top/'companyUUID'
GET -> request with company uuid as url parameter
### 'travelslotUUID'
GET -> request with travelslot uuid as url parameter
response 
```
{
    <travelslot details>
}
```
### all
POST -> request
```
{
    filters {
        query {
            fromHour
            minRating
            fromCity
            toCity
        }
        pageNumber
    }
}
```
response 
```
{
    company {
        uuid
        title
        averageRating
        reviewCount
    }
    travelslot {
        uuid
        averageRating
        reviewCount
        fromHour
        fromMinute
        fromCity
        travelTime
        toCity
        luxuryCategory
        isPetAllowed
        is3Seater
    }
}
```
## review
subdoc parameters are;
```
    "driver",
    "hostess",
    "breaks",
    "travel",
    "baggage",
    "pet",
    "comfort",
    "vehicle"
```
### :subdoc/like
POST -> Authorization bearer token is required(jwt).
```
{
    review {
        uuid
    }
}
```
response
```
review {
    uuid,
    subDocument,
    canDislike: true,
    canLike: false
}
```
### :subdoc/dislike
POST -> Authorization bearer token is required(jwt).
```
{
    review {
        uuid
    }
}
```
response
```
review {
    uuid,
    subDocument,
    canDislike: false,
    canLike: true
}
```
### :subdoc/update
POST -> Authorization bearer token is required(jwt).
```
{
    review {
        uuid,
        comment,
        rating
    }
}
```
### :subdoc/delete
POST -> Authorization bearer token is required(jwt).
```
{
    review {
        uuid
    }
}
```
### all
POST -> Authorization bearer token is optional(jwt).
```
{
    filters {
        query {
            companyUUID
            travelslotUUID
        }
        pageNumber
    }
}
```
response
```
{
    uuid
    averageRating
    createdAt
    canEdit
    <subdocument responses>
    user {
        userName
        firstName
        lastName
        email
    }
}
```
### create
POST -> Authorization bearer token is required(jwt).
```
{
    review {
        subdocuments {
            comment
            rating
        }
    }
}
```
response
```
{
    data {
        reviewUUID
    }
}
```
