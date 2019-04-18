"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const { Post } = require("./models");

const router = express.Router();
const jsonParser = bodyParser.json();

router.get("/", (req, res) => {
  const options = {};
  for (const key in req.query) {
    options[key] = req.query[key];
  }

  Post.find(options)
    .then(posts => {
      res.json({ posts: posts.map(post => post.serialize()) });
    })
    .catch(err => {
      res.json({ message: "Search error" });
    });
});

router.put("/apply/:postID", jsonParser, (req, res) => {
  if (!req.body.applicant) {
    return res.status(400).end();
  }
  Post
    .findOne({ _id: req.params.postID })
    .then(post => {
      const duplicate = post.applicants.reduce(
        (acc, cur) => (cur.email === req.body.applicant.email ? ++acc : acc),
        0
      );
      if (duplicate) {
        const message = `You have already applied to this post (email: ${req.body.applicant.email})`;
        return res.status(400).send(message);
      }
      post.applicants.push(req.body.applicant);
      return post.save();
    })
    .then(() => res.status(204).end())
    .catch(err => console.error(err));
});
module.exports = { router };
