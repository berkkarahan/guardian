import mongoose from "mongoose";
import moment from "moment";
import { isIP } from "validator";
import { merge } from "lodash";
import jwt from "jsonwebtoken";
import config from "../envvars";
import abstract from "./abstract";

const session = merge(
  {
    login_ip: {
      type: String,
      validate: {
        validator: function(v) {
          return isIP(v);
        },
        message: props => `${props.value} is not a valid IP adress!`
      }
    },
    login_date: {
      type: Date,
      default: function setNow() {
        return moment();
      }
    },
    login_device: { type: String },
    jwt_token: { type: String },
    requests: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  abstract.baseSchema
);
const sessionSchema = new mongoose.Schema(session, abstract.baseOptions);

sessionSchema.index(
  { user: 1, login_ip: 1, login_device: 1 },
  { unique: true }
);

sessionSchema.virtual("tillLastLogin").get(function() {
  const login = moment(this.login_date);
  const now = moment();
  return moment.duration(login.diff(now)).asHours();
});

sessionSchema.virtual("requestsPerHour").get(function() {
  const duration = this.tillLastLogin;
  return this.requests / duration;
});

sessionSchema.methods.validateSession = async function() {
  jwt.verify(this.jwt_token, config.jwt_secret);
};

const Session = mongoose.model("Session", sessionSchema);

export default {
  session: Session
};
