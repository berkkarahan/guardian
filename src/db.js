import mongoose from "mongoose";
// import { MongoMemoryServer } from "mongodb-memory-server";
import user from "./models/user";
import token from "./models/tokens";
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
const Token = token.token;

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

// const connectInMemory = async function() {
//   const mongod = new MongoMemoryServer();
//   const uri = await mongod.getConnectionString();
//   const mongooseOpts = {
//     useNewUrlParser: true,
//     autoReconnect: true,
//     reconnectTries: Number.MAX_VALUE,
//     reconnectInterval: 1000
//   };
//   await mongoose.connect(uri, mongooseOpts);
// };

const connectDB = function() {
  if (isTest) {
    // mongoose.connect(config.mongo_test);
    // connectInMemory();
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
    travelslots: Travelslots,
    token: Token
  }
};
