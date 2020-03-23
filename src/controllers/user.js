import moment from "moment";
import passport from "passport";
import { concat } from "lodash";
import db from "../db";
import ip from "../utils/ip";
import customErrors from "../utils/errors";
import tryCatch from "../utils/catcher";
import config from "../envvars";
import Token from "../models/tokens";
import mailer from "../utils/mailer";

const User = db.models.user;
const getIP = ip.fn;

const isProduction = config.node_env === "production";

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

const getUserDetails = tryCatch(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const userJson = await user.toJSON();
  res.status(200).json(userJson);
});

const getUserProfile = tryCatch(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    data: {
      userName: user.userName,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

const getUser = tryCatch(async (req, res, next) => {
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
  res.status(200).json({ user: userJson });
});

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
      res.status(403).json(info);
    }
    if (user) {
      const userJson = await user.userToJSON();
      req.login(user, loginError => {
        if (loginError) {
          res.status(403).json(loginError);
        }
      });
      res.status(200).json({ user: userJson });
    }
    res.status(403).json(info);
  })(req, res, next);
});

const loginHandler = async (req, res, next) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(403);
  }
};

// Different from previous, this is served over GET request.
const logoutUserv2 = tryCatch(async (req, res, next) => {
  await req.logout();
  if (!isProduction) {
    res.status(200).send();
  } else {
    res.redirect("/");
  }
});

const createUser = tryCatch(async (req, res, next) => {
  const user = new User(req.body.user);
  const now = moment();

  user.timestamp_register = now;
  user.activated = now;
  user.register_ip = getIP(req);

  createRestrictedFields.forEach(key => {
    delete user[key];
  });
  await user.save();

  // create user verification token
  const verifToken = new Token();
  await verifToken.generateVerificationToken(user);

  // send email for the verification token
  // change this to production version later on.
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const verifUrl = `${baseUrl}/api/auth/verification?uuid=${verifToken.token_uuid}`;
  await mailer.verification.test(verifUrl);
  const userJson = await user.userToJSON();
  res.status(201).json(userJson);
});

const updateUser = tryCatch(async (req, res, next) => {
  updateRestrictedFields.forEach(key => {
    delete req.body.user[key];
  });
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    req.body.user
  );
  const userJson = user.userToJSON();
  res.status(200).json(userJson);
});

const deactivateUser = tryCatch(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user.deactivated) {
    user.deactivated = moment();
  } else {
    throw new customErrors.UserAlreadyDeactivated(
      `User with email ${user.email} is already deactivated.`
    );
  }
  await user.save();
  res.status(200).json();
});

export default {
  preload: getUser,
  get: getUserDetails,
  profile: getUserProfile,
  create: createUser,
  update: updateUser,
  deactivate: deactivateUser,
  login: loginUserv2,
  loginHandler: loginHandler,
  logout: logoutUserv2
};
