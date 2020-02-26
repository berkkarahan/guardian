import { Strategy } from "passport-local";
import passportCustom from "passport-custom";
import passport from "passport";
import userModel from "../models/user";
import sessionModel from "../models/session";
import ip from "../utils/ip";

const getIP = ip.fn;

const User = userModel.user;
const Session = sessionModel.session;
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

const sessionStrategy = new passportCustom.Strategy(async function(req, done) {
  const userIP = getIP(req);
  const userAgent = req.get("user-agent");
  const _session = await Session.findOne({
    user: req.body.user.id,
    login_ip: userIP,
    login_device: userAgent
  })
    .populate("user")
    .exec();
  try {
    await _session.validateSession();
    return done(null, _session.user);
  } catch (err) {
    return done(null, false, { errors: { session: "is invalid" } });
  }
});

// const serializeUser = async function(reqestUser, done) {
//   done(null, reqestUser.id);
// };

// const deserializeUser = async function(id, done) {
//   const _user = await User.findById(id);
//   done(null, _user.userToJSON());
// };

const authenticateSession = (req, res, next) => {
  passport.authenticate("session", { session: false }, function(
    err,
    user,
    info
  ) {
    if (err) {
      return next(err);
    }

    if (user) {
      req.user = user;
      next();
    }
    return res.status(422).json(info);
  })(req, res, next);
};

export default {
  localStrategy: localStrategy,
  sessionStrategy: sessionStrategy,
  authenticate: authenticateSession
};
