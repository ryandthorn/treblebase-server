"use strict";
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const { PORT, TEST_DATABASE_URL } = require("./config");
const { router: usersRouter } = require("./users");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");
const { router: postsRouter } = require("./posts");

const app = express();
const jwtAuth = passport.authenticate("jwt", { session: false });

passport.use(localStrategy);
passport.use(jwtStrategy);
mongoose.set("useCreateIndex", true);
app.use(cors());
app.use(morgan("common"));

app.use("/api/users/", usersRouter);
app.use("/api/auth/", authRouter);
app.use("/api/posts/", jwtAuth, postsRouter);
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
