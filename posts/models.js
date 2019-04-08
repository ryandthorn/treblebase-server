"use strict";
const mongoose = require("mongoose");

const recordingSchema = mongoose.Schema({
  url: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true }
});

const applicantSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  instrument: { type: String, required: true },
  recordings: [recordingSchema],
  email: { type: String, required: true },
  bio: String,
  resume: String,
  region: { type: String, required: true },
  location: { type: String, required: true }
});

const postSchema = mongoose.Schema({
  datePosted: Date,
  postedBy: String,
  company: String,
  title: String,
  content: String,
  applicants: [applicantSchema],
  open: Boolean,
  fee: String,
  picture: String,
  region: String,
  location: String
});

postSchema.methods.serialize = function() {
  return {
    id: this._id,
    postedBy: this.postedBy,
    company: this.company,
    title: this.title,
    content: this.content,
    applicants: this.applicants.length,
    open: this.open,
    fee: this.fee,
    picture: this.picture,
    region: this.region,
    location: this.location
  };
};
const Post = mongoose.model("Post", postSchema);

module.exports = { Post };
