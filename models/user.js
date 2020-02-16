import mongoose from "mongoose";
import { isIP, isEmail } from "validator";
import { merge } from "lodash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import abstract from "./abstract";
import config from "../config";

const session = merge(
  {
    login_ip: {
      type: String,
      validate: {
        validator: function(v) {
          return isIP(v, [4, 6]);
        },
        message: props => `${props.value} is not a valid IP adress!`
      }
    },
    login_device: { type: String },
    jwt_token: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  abstract.baseSchema
);
const sessionSchema = new mongoose.Schema(session, abstract.baseOptions);
const Session = mongoose.model("Session", sessionSchema);

const user = merge(
  {
    user_name: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return isEmail(v);
        },
        message: props => `${props.value} is not a valid email adress!`
      }
    },
    password: { type: String },
    gender: {
      type: String,
      enum: [
        "male", // male
        "female", // female
        "other" // lets not disrespect anyone
      ]
    },
    is_admin: { type: Boolean, default: false },
    register_ip: {
      type: String,
      validate: {
        validator: function(v) {
          return isIP(v, [4, 6]);
        },
        message: props => `${props.value} is not a valid IP adress!`
      }
    },
    last_login_ip: {
      type: String,
      validate: {
        validator: function(v) {
          return isIP(v, [4, 6]);
        },
        message: props => `${props.value} is not a valid IP adress!`
      }
    },
    timestamp_register: { type: Date },
    timestamp_last_login: { type: Date },
    activated: { type: Date },
    verified: { type: Date },
    verification_token: { type: String }
  },
  abstract.baseSchema
);
const userSchema = new mongoose.Schema(user, abstract.baseOptions);

userSchema.pre("save", function(next) {
  const currentUser = this;
  if (!currentUser.isModified("password")) return next();
  bcrypt.hash(currentUser.password, 10, function(err, password) {
    if (err) return next(err);
    currentUser.password = password;
    // delete all sessions of the user once password changes
    Session.deleteMany(
      {
        user: currentUser._id
      },
      function(err) {
        if (err) console.log(err);
      }
    );
    next();
  });
});

userSchema.methods.comparePassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generateJWT = function() {
  const payload = {
    id: this._id,
    uuid: this.uuid,
    username: this.user_name,
    email: this.email,
    is_admin: this.is_admin
  };
  const options = {
    expiresIn: config.jwt_expiresin,
    issuer: config.jwt_issuer
  };
  return jwt.sign(payload, config.jwt_secret, options);
};

userSchema.methods.toAuthJSON = function() {
  return {
    uui: this.uuid,
    username: this.username,
    email: this.email,
    is_admin: this.admin,
    token: this.generateJWT()
  };
};

const User = mongoose.model("User", userSchema);

export default {
  session: Session,
  user: User
};
