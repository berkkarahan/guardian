import passport from "passport";
import moment from "moment";
import ip from "../utils/ip";
import tryCatch from "../utils/catcher";
import Token from "../models/tokens";

const getIP = ip.fn;

const loginUserv2 = tryCatch(async (req, res, next) => {
  // eslint-disable-next-line array-callback-return
  Object.keys(req.body.user).map(key => {
    if (key !== "email" && key !== "password") {
      res.status(422).json({
        errors: {
          message: "email and password are required"
        }
      });
    }
  });
  await passport.authenticate("local", async function(err, user, info) {
    if (err) {
      return res.status(403).json(info);
    }
    if (user) {
      const userJson = await user.userToJSON();
      req.login(user, async loginError => {
        if (loginError) {
          return res.status(403).json(loginError);
        }
      });
      return res.status(200).json({ user: userJson });
    }
    res.status(403).json(info);
  })(req, res, next);
});

const loginHandler = async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return res.status(403);
  }
  req.logIn(user, function(err) {
    if (err) {
      return next(err);
    }
    res.status(200).json(user);
  });
};

const loginHandlerJwt = tryCatch(async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return res.status(403);
  }
  const jwt = await user.generateJWT();

  // Delete timed out blacklist tokens from db on user's next login
  const blacklistedTokens = await Token.find({ user: user, type: "blacklist" });
  if (blacklistedTokens) {
    blacklistedTokens.forEach(async blacklistToken => {
      const verificationStatus = await blacklistToken.validateToken();
      if (!verificationStatus) {
        await blacklistToken.remove();
      }
    });
  }

  // update last_login_ip and timestamp_last_login
  const now = moment();
  user.last_login_ip = getIP(req);
  user.timestamp_last_login = now;
  await user.save();

  res
    .status(200)
    .json({ jwt: jwt, user: { username: user.userName, email: user.email } });
});

// Different from previous, this is served over GET request.
const logoutUserv2 = tryCatch(async (req, res, next) => {
  await req.logout();
  res.status(200).json();
});

const logoutUserJwt = tryCatch(async (req, res, next) => {
  const token = req.tokens.jwt;
  const tokenObj = await Token.findOne({
    jwt_token: token,
    token_type: "blacklist"
  });
  if (!tokenObj) {
    const blacklistToken = new Token();
    await blacklistToken.generateBlacklistToken(token, req.user);
    return res.status(200).send();
  }
  res
    .status(403)
    .json({ error: "Token was already blacklisted.", token: tokenObj });
});

export default {
  login: { cookie: loginUserv2 },
  loginHandler: { cookie: loginHandler, jwt: loginHandlerJwt },
  logout: { cookie: logoutUserv2, jwt: logoutUserJwt }
};
