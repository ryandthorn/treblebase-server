"use strict";
global.TEST_DATABASE_URL = "mongodb://localhost/test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, runServer, closeServer } = require("../server");
// const { Post } = require("../posts");

const expect = chai.expect;
chai.use(chaiHttp);

describe("/api/posts", function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it("should get all posts on GET", function() {
    return chai
      .request(app)
      .get("/api/posts")
      .set({
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoiYXNkZkBoZWxsby5jb20ifSwiaWF0IjoxNTUzNDgyOTg4LCJleHAiOjMxMDY5Njk1MjMsInN1YiI6ImFzZGZAaGVsbG8uY29tIn0.gBIOUIW30Ns3gWEiDsjSz3Vc_whGUz0gXvyBM5MgE0g"
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.an("object");
        expect(res.body).to.have.key("posts");
        expect(res.body.posts).to.have.length.of.at.least(1);
      });
  });

  it("should filter posts using query parameters", function() {
    return chai
      .request(app)
      .get("/api/posts/?location=Seattle,%20WA")
      .set({
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoiYXNkZkBoZWxsby5jb20ifSwiaWF0IjoxNTUzNDgyOTg4LCJleHAiOjMxMDY5Njk1MjMsInN1YiI6ImFzZGZAaGVsbG8uY29tIn0.gBIOUIW30Ns3gWEiDsjSz3Vc_whGUz0gXvyBM5MgE0g"
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.an("object");
        expect(res.body).to.have.key("posts");
        expect(res.body.posts).to.have.length.of.at.least(1);
        expect(res.body.posts[0].location).to.equal("Seattle, WA");
      });
  });
});
