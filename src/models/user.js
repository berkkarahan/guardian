import mongoose from "mongoose";
import { isIP, isEmail } from "validator";
import { merge } from "lodash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import abstract from "./abstract";
import config from "../envvars";

const user = merge(
  {
    title: { type: String },
    userName: {
      type: String,
      required: [true, "can't be blank"],
      unique: true,
      index: true,
      lowercase: true
    },
    firstName: { type: String },
    lastName: { type: String },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return isEmail(v);
        },
        message: props => `${props.value} is not a valid email adress!`
      },
      required: [true, "can't be blank"],
      unique: true,
      index: true,
      lowercase: true
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
          return isIP(v);
        },
        message: props => `${props.value} is not a valid IP adress!`
      }
    },
    last_login_ip: {
      type: String,
      validate: {
        validator: function(v) {
          return isIP(v);
        },
        message: props => `${props.value} is not a valid IP adress!`
      }
    },
    timestamp_register: { type: Date },
    timestamp_last_login: { type: Date },
    activated: { type: Date },
    deactivated: { type: Date },
    verified: { type: Date }
  },
  abstract.baseSchema
);
const userSchema = new mongoose.Schema(user, abstract.baseOptions);

// pre-save update title
userSchema.pre("save", async function(next) {
  const currentUser = this;
  currentUser.title = `${currentUser.firstName} ${currentUser.lastName} - ${currentUser.email}`;
  next();
});

// pre-save hash password
userSchema.pre("save", async function(next) {
  const currentUser = this;
  if (!currentUser.isModified("password")) return next();
  currentUser.password = await bcrypt.hash(currentUser.password, 10);
  next();
});

// Custom query methods

userSchema.query.activeAndVerified = async function() {
  return this.find({
    deactivated: { $exists: false },
    verified: { $exists: true }
  });
};

// User methods

userSchema.methods.userToJSON = async function() {
  return {
    uuid: this.uuid,
    id: this._id,
    username: this.username,
    email: this.email,
    is_admin: this.admin
  };
};

userSchema.methods.isVerified = async function() {
  return Boolean(this.verified);
};

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = async function() {
  const payload = {
    id: this._id,
    uuid: this.uuid,
    username: this.userName,
    email: this.email,
    is_admin: this.is_admin,
    is_verified: await this.isVerified()
  };
  const options = {
    expiresIn: config.jwt_expiresin,
    issuer: config.jwt_issuer
  };
  return jwt.sign(payload, config.jwt_secret, options);
};

const User = mongoose.model("User", userSchema);

export default User;
