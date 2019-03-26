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

router.put("/apply/:postID", (req, res) => {
  const requiredFields = ["id", "applicant"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.postID !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${
      req.body.id
    }) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  Post.findOne({ _id: req.params.postID }).then(post => {
    const duplicate = post.applicants.reduce(
      (acc, cur) => (cur.email === req.body.applicant.email ? ++acc : acc),
      0
    );
    if (duplicate) {
      const message = `You have already applied to this post (email: ${
        req.body.applicant.email
      })`;
      return res.status(400).send(message);
    }

    Post.updateOne(
      {
        _id: req.params.postID
      },
      { $push: { applicants: req.body.applicant } }
    )
      .then(() => res.status(204).end())
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
  });
});
module.exports = { router };
