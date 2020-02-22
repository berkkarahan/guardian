import mongoose from "mongoose";
import user from "./models/user";
import session from "./models/session";
import review from "./models/review";
import company from "./models/company";
import config from "./envvars";

const isProduction = config.node_env === "production";
const isTest = config.node_env === "test";
const isDevelopment = config.node_env === "development";

const User = user.user;
const Session = session.session;
const Review = review.review;
const Company = company.company;
const Travelslots = company.travelslots;

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
  console.log("db connected");
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
