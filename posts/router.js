"use strict";
const express = require("express");
const router = express.Router();
const { Post } = require("./models");
router.use(express.json());

router.get("/", (req, res) => {
  Post.find({}).then(posts => {
    res.json({ posts: posts.map(post => post.serialize()) });
  });
});

module.exports = { router };
