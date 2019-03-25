"use strict";
const express = require("express");
const router = express.Router();
const { Post } = require("./models");
router.use(express.json());

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

module.exports = { router };
