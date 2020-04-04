import jwt from "express-jwt";
import connect from "connect";
import db from "../db";
import config from "../envvars";
import tryCatch from "../utils/catcher";

const User = db.models.user;
const Token = db.models.token;

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    const jwtToken = req.headers.authorization.split(" ")[1];
    req.tokens = { jwt: jwtToken };
    return jwtToken;
  }
  return null;
}

async function setTokenToRequest(req, res, next) {
  const token = getTokenFromHeader(req);
  req.tokens = { jwt: token };
  next();
}

async function checkTokenValidity(req, res, next) {
  const token = req.tokens.jwt;
  if (token) {
    const blacklistedToken = await Token.findOne({
      jwt_token: token,
      token_type: "blacklist"
    });
    if (blacklistedToken) {
      return res.status(403).json({ error: "Blacklisted token received." });
    }
  }
  next();
}

const tokenValidityChain = (function() {
  const chain = connect();
  [setTokenToRequest, checkTokenValidity].forEach(function(middleware) {
    chain.use(middleware);
  });
  return chain;
})();

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
    return res.status(403).json({
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
    return res.status(403).json({
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
  [optional, attachUserOptional].forEach(function(middleware) {
    chain.use(middleware);
  });
  return chain;
})();

const jwtAuth = {
  middleware: tokenValidityChain,
  authRequired: requiredChain,
  authOptional: optionalChain,
  authVerified: authenticatedAndVerified
};

export default jwtAuth;
