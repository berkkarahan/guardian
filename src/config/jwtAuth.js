import jwt from "express-jwt";
import config from "../envvars";

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

const jwtAuth = {
  required: jwt({
    secret: config.jwt_secret,
    userProperty: "user",
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: config.jwt_secret,
    userProperty: "user",
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = jwtAuth;
