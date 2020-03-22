import { Strategy } from "passport-local";
import passportCustom from "passport-custom";
import bcrypt from "bcrypt";
import User from "../models/user";

const LocalStrategy = Strategy;

const localStrategy = new LocalStrategy(
  {
    usernameField: "user[email]",
    passwordField: "user[pasword]"
  },
  async function(email, password, done) {
    const _user = await User.find({ email: email }).exec();
    if (!_user) {
      return done(null, false, { errors: { email: "is invalid" } });
    }
    await _user.comparePassword(password).then(res => {
      if (!res) {
        return done(null, false, { errors: { password: "is invalid" } });
      }
      return done(null, _user);
    });
  }
);

const customLocalStrategy = new passportCustom.Strategy(async function(
  req,
  done
) {
  const { email } = req.body.user;
  const { password } = req.body.user;

  const user = await User.findOne({ email: email });

  if (!user) {
    return done(null, false, { errors: { email: "is invalid" } });
  }
  await user.comparePassword(password).then(res => {
    if (!res) {
      return done(null, false, { errors: { password: "is invalid" } });
    }
    return done(null, user);
  });
});

const localSerializeUser = async function(user, done) {
  done(null, user.id);
};

const localDeserializeUser = async function(id, done) {
  await User.findById(id, (err, user) => {
    if (err) {
      return done(user);
    }
    done(null, user);
  });
};

const isAuthenticated = async (req, res, next) => {
  if (req.user) {
    return next();
  }

  res.status(401).json({
    error: "User not authenticated."
  });
};

const isAuthenticatedandVerified = async (req, res, next) => {
  if (req.user && req.user.verified) {
    return next();
  }
  res.status(403).json({
    error: "User not verified yet."
  });
};

export default {
  localStrategy: localStrategy,
  customLocalStrategy: customLocalStrategy,
  localSerializeUser: localSerializeUser,
  localDeserializer: localDeserializeUser,
  utils: { auth: isAuthenticated, verified: isAuthenticatedandVerified }
};
