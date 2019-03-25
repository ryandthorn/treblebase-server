"use strict";
const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  datePosted: Date, //
  postedBy: String, //
  company: String, //
  title: String, //
  content: String, //
  applicants: [Object],
  open: Boolean, //
  fee: String, //
  picture: String, //
  location: String
});

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
