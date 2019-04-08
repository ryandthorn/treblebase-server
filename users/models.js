"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const RecordingSchema = mongoose.Schema({
  url: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true }
});

const PhotoSchema = mongoose.Schema({
  url: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true }
});

const ArtistSchema = mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
    required: "Email is required"
  },
  password: {
    type: String,
    required: "Please enter a valid password (8-72 chars)",
    minlength: 8,
    maxlength: 72
  },
  website: { type: String, trim: true },
  region: String,
  location: { type: String, trim: true },
  age: Number,
  recordings: [RecordingSchema],
  photos: [PhotoSchema],
  headshot: { type: String, trim: true },
  bio: { type: String, trim: true },
  resume: { type: String, trim: true }
});

ArtistSchema.methods.serialize = function() {
  return {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    website: this.website,
    region: this.region,
    location: this.location,
    age: this.age,
    recordings: this.recordings,
    photos: this.photos,
    headshot: this.headshot,
    bio: this.bio,
    resume: this.resume
  };
};

ArtistSchema.virtual("auth").get(function() {
  return {
    email: this.email,
    id: this._id
  };
});

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
