/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
// tests/db-handler.js

import mongoose from "mongoose";
import config from "../src/envvars";

export const connectDB = async () => {
  //   await db.connect();
  await mongoose.connect(config.mongo_test);
};

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async () => {
  // await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoose.disconnect();
};

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async () => {
  const { collections } = mongoose.connection;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
