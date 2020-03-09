import moment from "moment";
import passport from "passport";
import { concat } from "lodash";
import db from "../db";
import ip from "../utils/ip";
import customErrors from "../utils/errors";

const User = db.models.user;
const Session = db.models.session;
const getIP = ip.fn;

const createRestrictedFields = [
  "is_admin",
  "last_login_ip",
  "timestamp_last_login",
  "deactivated",
  "verified"
];

const updateRestrictedFields = concat(createRestrictedFields, [
  "timestamp_register",
  "activated",
  "register_ip"
]);

const getUserDetails = async (req, res, next) => {
  const _user = await User.findById(req.user.id);
  return res.status(200).json(_user.toJSON());
};

const getUser = async (req, res, next) => {
  let loadedUser;
  if (req.body.user.username) {
    loadedUser = await User.findOne({ userName: req.body.user.username });
  }
  if (req.body.user.email && !loadedUser) {
    loadedUser = await User.findOne({ email: req.body.user.email });
  }
  if (!loadedUser) {
    res.status(403).json({ message: "User not found." });
  }
  const userJson = await loadedUser.userToJSON();
  await res.status(200).json({ user: userJson });
};

const loginUser = async (req, res, next) => {
  // eslint-disable-next-line array-callback-return
  Object.keys(req.body.user).map(key => {
    if (key !== "email" && key !== "password") {
      return res.status(422).json({
        errors: {
          message: "email and password are required"
        }
      });
    }
  });

  // authtenticate with passport local
  await passport.authenticate("local", { session: false }, async function(
    err,
    user,
    info
  ) {
    if (err) {
      console.log(err);
      console.log(info);
      return await res.status(403).json(info);
    }

    if (user) {
      const userIP = getIP(req);
      const loginDate = moment();
      const userAgent = req.get("user-agent");

      await user.setUserSession(userIP, loginDate, userAgent);

      const currentSession = await Session.findOne({
        user: user,
        login_ip: userIP,
        login_device: userAgent
      });

      const cookieOptions = {
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
        httpOnly: true,
        signed: true
      };

      res.cookie("sessionId", currentSession._id, cookieOptions);

      const userJson = await user.userToJSON();

      return await res.status(200).json({ user: userJson });
    }
    return await res.status(403).json(info);
  })(req, res, next);
};

const logoutUser = async (req, res, next) => {
  const _user = await User.findById(req.user._id);
  const userIP = getIP(req);
  const userAgent = req.get("user-agent");
  await _user.deleteUserSession(userIP, userAgent);
  return res.status(200).send();
};

const createUser = async (req, res, next) => {
  const _user = new User(req.body.user);
  const now = moment();

  _user.timestamp_register = now;
  _user.activated = now;
  _user.register_ip = getIP(req);

  createRestrictedFields.forEach(key => {
    delete _user[key];
  });
  await _user.save();
  return res.status(201).json(_user);
};

const updateUser = async (req, res, next) => {
  updateRestrictedFields.forEach(key => {
    delete req.body.user.update[key];
  });
  await User.findOneAndUpdate({ _id: req.user._id }, req.body.user.update);
  return await res.status(200).send();
};

const deactivateUser = async (req, res, next) => {
  const _user = await User.findById(req.user.id);
  if (!_user.deactivated) {
    _user.deactivated = moment();
  } else {
    throw new customErrors.UserAlreadyDeactivated(
      `User with email ${_user.email} is already deactivated.`
    );
  }
  await _user.save();
  return res.status(200);
};

export default {
  preload: getUser,
  get: getUserDetails,
  create: createUser,
  update: updateUser,
  deactivate: deactivateUser,
  login: loginUser,
  logout: logoutUser
};
