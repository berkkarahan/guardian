/* eslint-disable no-unused-vars */
import "@babel/polyfill";
import app from "./app";
import { clearDatabase, closeDatabase, connectDB } from "../test/dbHandler";

let server;

beforeAll(async () => {
  await connectDB();
  server = await app.listen(9999);
});

// afterEach(async () => await clearDatabase());

afterAll(async () => {
  await clearDatabase();
  await closeDatabase();
  await server.close();
});
