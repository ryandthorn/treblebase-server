"use strict";
global.DATABASE_URL = "mongodb://localhost/test";
const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");
const { Artist } = require("../users");

const expect = chai.expect;

chai.use(chaiHttp);

describe("/api/users", function() {
  const email = "example@email.com";
  const password = "unguessable";
  const firstName = "John";
  const lastName = "Doe";

  const user = { email, password, firstName, lastName };

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  afterEach(function() {
    return Artist.deleteOne({ email: "example@email.com" });
  });

  describe("CREATE", function() {
    it("should create a new user on POST", function() {
      return chai
        .request(app)
        .post("/api/users")
        .send(user)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.an("object");
          expect(res.body).to.have.keys("email", "id");
          expect(res.body.email).to.equal(email);
          return Artist.findOne({ email });
        })
        .then(user => {
          expect(user).to.not.be.null;
          expect(user.email).to.equal(email);
          return user.validatePassword(password);
        })
        .then(passTrue => {
          expect(passTrue).to.be.true;
        });
    });

    it("should return a validation error on invalid POST request", function() {
      return chai
        .request(app)
        .post("/api/users")
        .send({ email, password, firstName }) // Missing lastName
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal("ValidationError");
          expect(res.body.message).to.equal("Missing field");
          expect(res.body.location).to.equal("lastName");
        });
    });
  });

  describe("READ", function() {
    it("should retrieve serialized user info by ID in JWT on GET", function() {
      const testUser = {
        firstName: "Test",
        lastName: "User",
        email: "test@email.com",
        password: "thinkful999"
      };

      return chai
        .request(app)
        .post("/api/users")
        .send(testUser)
        .then(() => {
          return chai
            .request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password })
            .then(res => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.key("authToken");
              return res.body.authToken;
            })
            .then(JWT => {
              return chai
                .request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${JWT}`)
                .then(res => {
                  expect(res).to.have.status(200);
                  expect(res.body).to.contain.keys(
                    "email",
                    "firstName",
                    "lastName"
                  );
                  expect(res.body.email).to.equal("test@email.com");
                });
            });
        });
    });
  });

  describe("UPDATE", function() {
    let jwt;

    beforeEach(function() {
      return chai
        .request(app)
        .post("/api/users")
        .send(user)
        .then(() => {
          return chai
            .request(app)
            .post("/api/auth/login")
            .send({ email, password })
            .then(res => {
              jwt = res.body.authToken;
            });
        });
    });

    it("should modify and return user info on success", function() {
      return chai
        .request(app)
        .put("/api/users")
        .set({ Authorization: `Bearer ${jwt}` })
        .send({ resume: "Added", firstName: "Modified" })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.resume).to.equal("Added");
          expect(res.body.firstName).to.equal("Modified");
        });
    });

    it("should error when a user is not found", function() {
      return chai
        .request(app)
        .delete("/api/users")
        .set({ Authorization: `Bearer ${jwt}` })
        .then(() => {
          return chai
            .request(app)
            .put("/api/users")
            .set({ Authorization: `Bearer ${jwt}` })
            .send({ resume: "Added", firstName: "Modified" })
            .then(res => {
              expect(res).to.have.status(404);
              expect(res.body).to.deep.equal({
                message: "Error: user not found"
              });
            });
        });
    });

    it("should error when valid field is not modifiable", function() {
      return chai
        .request(app)
        .put("/api/users")
        .set({ Authorization: `Bearer ${jwt}` })
        .send({ email: "cannot@modify.this" })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            message: "Error: cannot update field 'email'"
          });
        });
    });

    it("should error when field is invalid", function() {
      return chai
        .request(app)
        .put("/api/users")
        .set({ Authorization: `Bearer ${jwt}` })
        .send({ invalid: "field" })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal(
            "Error: cannot update field 'invalid'"
          );
        });
    });
  });

  describe("DELETE", function() {
    it("should delete a user by ID in JWT on DELETE", function() {
      return chai
        .request(app)
        .post("/api/users")
        .send(user)
        .then(res => {
          expect(res).to.have.status(201);
          return chai
            .request(app)
            .post("/api/auth/login")
            .send({ email, password })
            .then(res => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.key("authToken");
              return chai
                .request(app)
                .delete("/api/users")
                .set({ Authorization: `Bearer ${res.body.authToken}` })
                .then(res => {
                  expect(res).to.have.status(204);
                });
            });
        });
    });
  });
});
