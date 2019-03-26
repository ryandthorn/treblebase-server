"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const { Artist } = require("./models");

const jsonParser = bodyParser.json();
const router = express.Router();

// Post to register a new user
router.post("/", jsonParser, (req, res) => {
  let { email, password, firstName, lastName } = req.body;

  return Artist.find({ email })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Email already in use",
          location: "email"
        });
      }
      return Artist.hashPassword(password);
    })
    .then(hash => {
      return Artist.create({
        email,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === "ValidationError") {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
});

module.exports = { router };
