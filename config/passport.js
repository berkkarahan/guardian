import passport from "passport";
import { Strategy } from "passport-local";
import user from "../models/user";

const User = user.user;
const Session = user.session;
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
    const _session = await Session.find({ user: _user._id }).exec();
    if (!_session) {
      return done(null, false, {
        errors: { email: "matching session not found" }
      });
    }
    done(null, _user);
  }
);

const serializeUser = function(user, done) {
  done(null, user);
};

const deserializeUser = function(user, done) {
  done(null, user);
};

export default {
  serializer: serializeUser,
  deserializer: deserializeUser,
  strategy: localStrategy
};
