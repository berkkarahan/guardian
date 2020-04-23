import mongoose from "mongoose";
import config from "./envvars";
import customErrors from "./utils/errors";

// Models setup
import User from "./models/user";
import Token from "./models/tokens";
import Review from "./models/review";
import company from "./models/company";

const Company = company.company;
const Travelslots = company.travelslots;

const isProduction = config.node_env === "production";
const isTest = config.node_env === "test";
const isDevelopment = config.node_env === "development";

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
    // mongoose.connect(config.mongo_test);
    // connectInMemory();
    return mongoose.connect(config.mongo_test, { autoIndex: true });
  }

  if (isProduction) {
    return mongoose.connect(config.mongo_prod, { autoIndex: true });
  }

  if (isDevelopment) {
    const conn = mongoose.connect(config.mongo_dev, { autoIndex: true });
    mongoose.set("debug", true);
    return conn;
  }
  if (!isConnected()) {
    throw new customErrors.MongooseConnection(
      "Mongoose is not connected to any MongoDB instance."
    );
  }
};

const connectUri = function(uri) {
  return mongoose.connect(uri);
};

const asyncConnectDB = async function() {
  if (isTest) {
    return await mongoose.connect(config.mongo_test);
  }

  if (isProduction) {
    return await mongoose.connect(config.mongo_prod);
  }

  if (isDevelopment) {
    const devConn = await mongoose.connect(config.mongo_dev);
    mongoose.set("debug", true);
    return devConn;
  }
  if (!isConnected()) {
    throw new customErrors.MongooseConnection(
      "Mongoose is not connected to any MongoDB instance."
    );
  }
};

export default {
  connect: connectDB,
  connectUri: connectUri,
  asyncConnect: asyncConnectDB,
  models: {
    user: User,
    review: Review,
    company: Company,
    travelslots: Travelslots,
    token: Token
  }
};
