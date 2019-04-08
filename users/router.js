"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const { Artist } = require("./models");

const jsonParser = bodyParser.json();
const router = express.Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

router.use(jsonParser);

router.get("/", jwtAuth, (req, res) => {
  Artist.findById(req.user.id)
    .then(user => {
      res.status(200).send(user.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(401).send({ message: "Unauthorized" });
    });
});

router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["email", "password", "firstName", "lastName"];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      location: missingField
    });
  }

  const stringFields = ["email", "password", "firstName", "lastName"];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== "string"
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }

  const explicityTrimmedFields = ["email", "password"];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    password: {
      min: 8,
      // bcrypt truncates after 72 characters
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      "min" in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      "max" in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { email, password, firstName, lastName } = req.body;

  return Artist.find({ email })
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same email
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Email already taken",
          location: "email"
        });
      }
      // If there is no existing user, hash the password
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
      return res.status(201).json(user.auth);
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === "ValidationError") {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
});

router.put("/", jwtAuth, (req, res) => {
  const updates = {};
  const updateableFields = [
    "firstName",
    "lastName",
    "website",
    "region",
    "location",
    "age",
    "recordings",
    "photos",
    "headshot",
    "bio",
    "resume"
  ];
  console.log({ body: req.body });
  for (const key in req.body) {
    if (updateableFields.includes(key)) {
      updates[key] = req.body[key];
    } else {
      return res
        .status(400)
        .json({ message: `Error: cannot update field '${key}'` });
    }
  }

  Artist.findOneAndUpdate(
    { _id: req.user.id },
    { $set: updates },
    { new: true }
  )
    .then(user => {
      if (!user) {
        res.status(404).json({ message: "Error: user not found" });
      }
      res.status(200).json(user.serialize());
    })
    .catch(err => {
      console.error(err);
    });
});

router.delete("/", jwtAuth, (req, res) => {
  Artist.findByIdAndDelete(req.user.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      res
        .status(500)
        .json({ code: 500, message: "Error: could not delete user" });
    });
});

module.exports = { router };
