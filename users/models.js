"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const ArtistSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    required: "Email is required"
  },
  password: { type: String, required: true },
  website: String,
  location: String,
  age: String,
  recordings: [String],
  photos: [String],
  headshot: String,
  bio: String,
  resumeUrl: String
});

ArtistSchema.methods.serialize = function() {
  return {
    email: this.email || ""
  };
};

ArtistSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
});

ArtistSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

ArtistSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const Artist = mongoose.model("Artist", ArtistSchema);

module.exports = { Artist };
