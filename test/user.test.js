/* eslint-disable no-unused-vars */
import request from "supertest";
import { cloneDeep } from "lodash";
import { connectDB } from "./dbHandler";

const serverAddr = "127.0.0.1:9999";

const mockUser = {
  user_name: "testguy",
  email: "testmail@testy.com",
  password: "test"
};

const reqBody = { user: mockUser };

describe("User endpoints", () => {
  it("should create a new user", async () => {
    const res = await request(serverAddr)
      .post("/api/users/signup")
      .send(reqBody);

    expect(res.statusCode).toEqual(201);
  });

  it("should login the created user", async () => {
    const loginBody = cloneDeep(reqBody);
    delete loginBody.user.user_name;

    const loginRes = await request(serverAddr)
      .post("/api/users/login")
      .send(loginBody);

    expect(loginRes.statusCode).toEqual(200);
  });

  it("should get user details without authentication", async () => {
    const userBody = { user: { username: mockUser.user_name } };
    const userRes = await request(serverAddr)
      .post("/api/users/preload")
      .send(userBody);

    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body.user.email).toEqual(mockUser.email);
  });

  it("should update an existing user", async () => {
    const userBody = { user: { username: mockUser.user_name } };
    const userRes = await request(serverAddr)
      .post("/api/users/preload")
      .send(userBody);

    expect(userRes.statusCode).toEqual(200);
    expect(userRes.body.user.email).toEqual(mockUser.email);

    const newEmail = "testrocks@testy.com";
    const updateBody = {
      user: { id: userRes.body.user.id, update: { email: newEmail } }
    };
    const updateRes = await request(serverAddr)
      .post("/api/users/update")
      .send(updateBody);
    expect(updateRes.statusCode).toEqual(200);
  });
});
