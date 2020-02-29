import moment from "moment";
import passport from "passport";
import { concat } from "lodash";
import db from "../db";
import ip from "../utils/ip";
import customErrors from "../utils/errors";

const User = db.models.user;
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
  "register_ip",
  "verification_token"
]);

const getUserDetails = async (req, res, next) => {
  const _user = await User.findById(req.user.id);
  return res.status(200).json(_user.toJSON());
};

const getUser = async (req, res, next) => {
  let loadedUser;
  if (req.body.username) {
    loadedUser = await User.find({ user_name: req.body.username }).exec();
  }
  if (req.body.email && !loadedUser) {
    loadedUser = await User.find({ email: req.body.email }).exec();
  }
  if (!loadedUser) {
    res.status(200).json({ message: "User not found." });
  }
  res.status(200).json({ user: loadedUser.userToJSON() });
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
      return await res.status(403).json(info);
    }

    if (user) {
      const userIP = getIP(req);
      const loginDate = moment();
      const userAgent = req.get("user-agent");

      await user.setUserSession(userIP, loginDate, userAgent);

      const userJson = await user.userToJSON();
      return await res.status(200).json({ user: userJson });
    }
    return await res.status(403).json(info);
  })(req, res, next);
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
    delete req.body[key];
  });
  await User.findOneAndUpdate({ _id: req.user.id }, req.body);
  return res.status(200);
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
  login: loginUser
};
