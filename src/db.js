import mongoose from "mongoose";
import user from "./models/user";
import session from "./models/session";
import review from "./models/review";
import company from "./models/company";
import config from "./envvars";
import customErrors from "./utils/errors";

const isProduction = config.node_env === "production";
const isTest = config.node_env === "test";
const isDevelopment = config.node_env === "development";

const User = user.user;
const Session = session.session;
const Review = review.review;
const Company = company.company;
const Travelslots = company.travelslots;

const isConnected = function() {
  const state = mongoose.connections
    .map(conn => {
      return conn.readyState;
    })
    .reduce((total, num) => {
      return total * num;
    });
  if (state === 0) {
    return false;
  }
  return true;
};

const connectDB = function() {
  if (isTest) {
    mongoose.connect(config.mongo_test);
    return;
  }

  if (isProduction) {
    mongoose.connect(config.mongo_prod);
    return;
  }

  if (isDevelopment) {
    mongoose.connect(config.mongo_dev);
    mongoose.set("debug", true);
    return;
  }
  if (!isConnected()) {
    throw new customErrors.MongooseConnection(
      "Mongoose is not connected to any MongoDB instance."
    );
  }
};

export default {
  connect: connectDB,
  models: {
    user: User,
    session: Session,
    review: Review,
    company: Company,
    travelslots: Travelslots
  }
};
