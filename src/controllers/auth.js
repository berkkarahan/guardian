import passport from "passport";
import tryCatch from "../utils/catcher";
import Token from "../models/tokens";

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
      await res.status(403).json(info);
    }
    if (user) {
      const userJson = await user.userToJSON();
      req.login(user, async loginError => {
        if (loginError) {
          await res.status(403).json(loginError);
        }
      });
      await res.status(200).json({ user: userJson });
    }
    await res.status(403).json(info);
  })(req, res, next);
});

const loginHandler = async (req, res, next) => {
  const { user } = req;
  if (!user) {
    await res.status(403);
  }
  req.logIn(user, function(err) {
    if (err) {
      return next(err);
    }
    return res.status(200).json(user);
  });
};

const loginHandlerJwt = tryCatch(async (req, res, next) => {
  const { user } = req;
  if (!user) {
    await res.status(403);
  }
  const jwt = await user.generateJWT();
  res.status(200).json({ jwt: jwt });
});

// Different from previous, this is served over GET request.
const logoutUserv2 = tryCatch(async (req, res, next) => {
  await req.logout();
  await res.status(200).json();
});

const logoutUserJwt = tryCatch(async (req, res, next) => {
  const token = req.tokens.jwt;
  const tokenObj = await Token.findOne({
    jwt_token: token,
    token_type: "blacklist"
  });
  if (!tokenObj) {
    const blacklistToken = new Token({
      jwt_token: token,
      token_type: "blacklist"
    });
    await blacklistToken.save();
    return res.status(200).json(blacklistToken);
  }
  await res
    .status(403)
    .json({ error: "Token was already blacklisted.", token: tokenObj });
});

export default {
  login: { cookie: loginUserv2 },
  loginHandler: { cookie: loginHandler, jwt: loginHandlerJwt },
  logout: { cookie: logoutUserv2, jwt: logoutUserJwt }
};
