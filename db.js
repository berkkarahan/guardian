import mongoose from "mongoose";
import user from "./models/user";
import config from "./config/index";

const isProduction = config.node_env === "production";
const isTest = config.node_env === "test";
const isDevelopment = config.node_env === "development";

const User = user.user;
const Session = user.session;

const connectDB = function() {
  if (isTest) {
    mongoose.connect(config.mongo_test);
  }

  if (isProduction) {
    mongoose.connect(config.mongo_prod);
  }

  if (isDevelopment) {
    mongoose.connect(config.mongo_dev);
    mongoose.set("debug", true);
  }
};

export default connectDB;
