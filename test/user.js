/* eslint-disable no-unused-vars */
//Require the dev-dependencies
import chai from "chai";
import chaiHttp from "chai-http";
import request from "supertest";
import server from "../dist/server";
import db from "../src/db";

const User = db.models.user;
const Session = db.models.session;

const should = chai.should();

const mockUser = {
  user_name: "testguy",
  email: "testmail@testy.com",
  password: "test"
};

chai.use(chaiHttp);

describe("Users", () => {
  beforeEach(done => {
    User.remove({}, _err => {
      done();
    });
    Session.remove({}, _err => {
      done();
    });
  });

  describe("Signup user", () => {
    it("it should create a new user", done => {
      chai
        .request(server)
        .post("/api/users/signup")
        .send(mockUser)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
  });

  describe("Login user", () => {
    it("it should login created user", done => {
      chai
        .request(server)
        .post("/api/users/login")
        .send(mockUser)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
