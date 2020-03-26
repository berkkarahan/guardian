import jwt from "express-jwt";
import connect from "connect";
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

const required = jwt({
  secret: config.jwt_secret,
  userProperty: "user",
  getToken: getTokenFromHeader
});

const optional = jwt({
  secret: config.jwt_secret,
  userProperty: "user",
  credentialsRequired: false,
  getToken: getTokenFromHeader
});

const verified = async (req, res, next) => {
  const verificationStatus = await req.user.isVerified();
  if (!verificationStatus) {
    await res.status(403).json({
      error: "User not verified."
    });
  }
  next();
};

const authenticatedAndVerified = (function() {
  const chain = connect();
  [required, verified].forEach(function(middleware) {
    chain.use(middleware);
  });
  return chain;
})();

const jwtAuth = {
  authRequired: required,
  authOptional: optional,
  authVerified: authenticatedAndVerified
};

export default jwtAuth;
