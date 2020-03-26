import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { uuid, isUuid } from "uuidv4";
import moment from "moment";
import config from "../envvars";
import abstract from "./abstract";
import User from "./user";

const tokenSchema = new mongoose.Schema(
  {
    jwt_token: {
      type: String
    },
    token_type: {
      type: String,
      enum: ["verification", "pwdreset", "blacklist"]
    },
    token_uuid: {
      type: String,
      validate: {
        default: function setToken() {
          return uuid();
        },
        validator: function(v) {
          return isUuid(v);
        },
        message: props => `${props.value} is not a valid uuid!`
      },
      unique: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  abstract.baseOptions
);

tokenSchema.methods.isUUID = async function(inputUuid) {
  return isUuid(inputUuid);
};

tokenSchema.methods.validateToken = async function() {
  return jwt.verify(this.jwt_token, config.jwt_secret);
};

tokenSchema.methods.verifyUser = async function() {
  if (!this.validateToken()) {
    return false;
  }
  await User.findByIdAndUpdate(this.user._id, { verified: moment() });
  return true;
};

tokenSchema.methods.resetPassword = async function(password) {
  if (!this.validateToken()) {
    return false;
  }
  await User.findByIdAndUpdate(this.user._id, { password: password });
};

tokenSchema.methods.generateVerificationToken = async function(userObject) {
  const jwtToken = await userObject.generateJWT();
  const currentToken = this;
  currentToken.jwt_token = jwtToken;
  currentToken.token_type = "verification";
  currentToken.token_uuid = uuid();
  currentToken.user = userObject;
  await currentToken.save();
};

tokenSchema.methods.generatePasswordResetToken = async function(userObject) {
  const jwtToken = await userObject.generateJWT();
  const currentToken = this;
  currentToken.jwt_token = jwtToken;
  currentToken.token_type = "pwdreset";
  currentToken.token_uuid = uuid();
  currentToken.user = userObject;
  await currentToken.save();
};

const Token = mongoose.model("Token", tokenSchema);

export default Token;
