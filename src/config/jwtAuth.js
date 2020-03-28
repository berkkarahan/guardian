import jwt from "express-jwt";
import connect from "connect";
import db from "../db";
import config from "../envvars";
import tryCatch from "../utils/catcher";

const User = db.models.user;

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    const jwtToken = req.headers.authorization.split(" ")[1];
    return jwtToken;
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

const attachUser = tryCatch(async (req, res, next) => {
  if (!req.user) {
    await res.status(403).json({
      error: "User can't be attached to req.user from database."
    });
  }
  req.user = await User.findById(req.user._id);
  next();
});

const attachUserOptional = tryCatch(async (req, res, next) => {
  if (req.user) {
    req.user = await User.findById(req.user._id);
  }
  next();
});

const verified = tryCatch(async (req, res, next) => {
  const verificationStatus = await req.user.isVerified();
  if (!verificationStatus) {
    await res.status(403).json({
      error: "User not verified."
    });
  }
  next();
});

const authenticatedAndVerified = (function() {
  const chain = connect();
  [required, attachUser, verified].forEach(function(middleware) {
    chain.use(middleware);
  });
  return chain;
})();

const requiredChain = (function() {
  const chain = connect();
  [required, attachUser].forEach(function(middleware) {
    chain.use(middleware);
  });
  return chain;
})();

const optionalChain = (function() {
  const chain = connect();
  [optional, attachUser].forEach(function(middleware) {
    chain.use(middleware);
  });
  return chain;
})();

const jwtAuth = {
  authRequired: requiredChain,
  authOptional: optionalChain,
  authVerified: authenticatedAndVerified
};

export default jwtAuth;
