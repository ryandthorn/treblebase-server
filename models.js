"use strict";
const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  date: Date,
  postedBy: String,
  title: String,
  content: String,
  applicants: [[String]]
});

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
