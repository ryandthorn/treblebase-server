"use strict";
global.DATABASE_URL = "mongodb://localhost/jwt-auth-demo-test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");

const { app, runServer, closeServer } = require("../server");
const { Artist } = require("../users");
const { JWT_SECRET } = require("../config");

const expect = chai.expect;
chai.use(chaiHttp);

describe("/api/auth", function () {
  const email = "example@email.com";
  const password = "unguessable";
  const firstName = "John";
  const lastName = "Doe";

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return Artist.hashPassword(password).then(hashPass =>
      Artist.create({ email, password: hashPass, firstName, lastName })
    );
  });

  afterEach(function () {
    return Artist.deleteOne({ firstName: "John" });
  });

  describe("/login", function () {
    it("should reject requests with no credentials", function () {
      return chai
        .request(app)
        .post("/api/auth/login")
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.text).to.equal("Bad Request");
        });
    });

    it("should reject requests with incorrect passwords", function () {
      return (
        chai
          .request(app)
          .post("/api/auth/login")
          // Passport expects fields 'username' and 'password'
          .send({ email, password: "wrongPassword" })
          .then(res => {
            expect(res).to.have.status(401);
            expect(res.text).to.equal("Unauthorized");
          })
      );
    });

    it("should return a valid JWT", function () {
      return chai
        .request(app)
        .post("/api/auth/login")
        .send({ email, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.an("object");
          const token = res.body.authToken;
          expect(token).to.be.a("string");
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ["HS256"]
          });
          expect(payload.user.email).to.equal(email);
        });
    });
  });

  describe("/refresh", function () {
    it("should reject requests with no credentials", function () {
      return chai
        .request(app)
        .post("/api/auth/login")
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.text).to.equal("Bad Request");
        });
    });

    it("should reject requests with an invalid token", function () {
      const token = jwt.sign(
        {
          email,
          firstName,
          lastName
        },
        "wrongSecret",
        {
          algorithm: "HS256",
          expiresIn: "7d"
        }
      );

      return chai
        .request(app)
        .post("/api/auth/refresh")
        .set("Authorization", `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal("Unauthorized");
        });
    });

    it("should reject requests with an expired token", function () {
      const token = jwt.sign(
        {
          user: {
            email,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: email
        }
      );

      return chai
        .request(app)
        .post("/api/auth/refresh")
        .set("authorization", `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal("Unauthorized");
        });
    });

    it("should return a valid auth token with a newer expiry date", function () {
      const token = jwt.sign(
        {
          user: {
            email,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: email,
          expiresIn: "7d"
        }
      );
      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post("/api/auth/refresh")
        .set("authorization", `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          const token = res.body.authToken;
          expect(token).to.be.a("string");
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ["HS256"]
          });
          expect(payload.user).to.deep.equal({
            email,
            firstName,
            lastName
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
});
