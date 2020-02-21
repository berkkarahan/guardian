import { Strategy } from "passport-local";
import passportCustom from "passport-custom";
import user from "../models/user";
import ip from "../utils/ip";

const getIP = ip.fn;

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

const sessionStrategy = new passportCustom.Strategy(async function(req, done) {
  const userIP = getIP(req);
  const userAgent = req.get("user-agent");
  const _session = await Session.findOne({
    user: req.user.id,
    login_ip: userIP,
    login_device: userAgent
  })
    .populate("user")
    .exec();
  try {
    await _session.validateSession();
    return done(null, _session.user._id);
  } catch (err) {
    done(null, false, { errors: { session: "is invalid" } });
  }
});

const serializeUser = function(reqestUser, done) {
  done(null, reqestUser.id);
};

const deserializeUser = function(id, done) {
  const _user = User.findById(id);
  done(null, _user.userToJSON());
};

export default {
  serializer: serializeUser,
  deserializer: deserializeUser,
  localStrategy: localStrategy,
  sessionStrategy: sessionStrategy
};
