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

const customLocalStrategy = new passportCustom.Strategy(async function(
  req,
  done
) {
  const { email } = req.body.user;
  const { password } = req.body.user;

  const _user = await User.findOne({ email: email });
  console.log(_user);
  if (!_user) {
    return done(null, false, { errors: { email: "is invalid" } });
  }
  await _user.comparePassword(password).then(res => {
    if (!res) {
      return done(null, false, { errors: { password: "is invalid" } });
    }
    return done(null, _user);
  });
});

const sessionStrategy = new passportCustom.Strategy(async function(req, done) {
  console.log(req.body.user);
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
    if (!(await _session.validateSession())) {
      return done(null, false, { errors: { session: "is invalid." } });
    }
    return done(null, _session.user);
  } catch (err) {
    return done(null, false, { errors: { session: "an error caught." } });
  }
});

// const serializeUser = async function(reqestUser, done) {
//   done(null, reqestUser.id);
// };

// const deserializeUser = async function(id, done) {
//   const _user = await User.findById(id);
//   done(null, _user.userToJSON());
// };

const authenticateSession = async (req, res, next) => {
  await passport.authenticate("session", { session: false }, async function(
    err,
    user,
    info
  ) {
    if (err) {
      return await next(err);
    }

    if (user) {
      req.user = user;
      return await next();
    }
    return await res.status(422).json(info);
  })(req, res, next);
};

export default {
  localStrategy: localStrategy,
  sessionStrategy: sessionStrategy,
  customLocalStrategy: customLocalStrategy,
  authenticate: authenticateSession
};
