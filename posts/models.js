"use strict";
const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  datePosted: Date,
  postedBy: String,
  company: String,
  title: String,
  content: String,
  applicants: [Object],
  open: Boolean,
  fee: String,
  picture: String,
  location: String
});

postSchema.methods.serialize = function() {
  return {
    postedBy: this.postedBy,
    company: this.company,
    title: this.title,
    content: this.content,
    applicants: this.applicants.length,
    open: this.open,
    fee: this.fee,
    picture: this.picture,
    location: this.location
  };
};
const Post = mongoose.model("Post", postSchema);

module.exports = { Post };