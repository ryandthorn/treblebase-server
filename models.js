"use strict";
const mongoose = require("mongoose");

const artistSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  website: String,
  location: String,
  age: String,
  recordings: [String],
  photos: [String],
  headshot: String
});

const postSchema = mongoose.Schema({
  date: Date,
  postedBy: String,
  title: String,
  content: String,
  applicants: [[String]]
});

const Artist = mongoose.model("Artist", artistSchema);
const Post = mongoose.model("Post", postSchema);

module.exports = { Artist, Post };
