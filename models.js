"use strict";
const mongoose = require("mongoose");

const artistSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  website: String,
  location: String,
  age: String,
  recordings: [String],
  photos: [String],
  headshot: String
});

// Post schema

const Artist = mongoose.model("Artist", artistSchema);

module.exports = { Artist, Post };
