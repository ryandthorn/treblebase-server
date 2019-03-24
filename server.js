"use strict";
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const { CLIENT_ORIGIN, PORT, TEST_DATABASE_URL } = require("./config");
const { router: usersRouter } = require("./users");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");

mongoose.set("useCreateIndex", true);

const app = express();

app.use(morgan("common"));

app.use(cors());

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use("/api/users/", usersRouter);
app.use("/api/auth/", authRouter);
const jwtAuth = passport.authenticate("jwt", { session: false });

app.get("/api/protected", jwtAuth, (req, res) => {
  return res.json({ data: "Test successful" });
});

app.use("/api/*", (req, res) => res.status(404).json({ message: "Not Found" }));

let server;

function runServer() {
  return new Promise((res, rej) => {
    mongoose.connect(TEST_DATABASE_URL, { useNewUrlParser: true }, err => {
      if (err) {
        return rej(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`App is listening on port ${PORT}`);
          res();
        })
        .on("error", err => {
          mongoose.disconnect();
          rej(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((res, rej) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return rej(err);
        }
        res();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
