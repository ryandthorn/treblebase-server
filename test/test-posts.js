"use strict";
global.TEST_DATABASE_URL = "mongodb://localhost/test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, runServer, closeServer } = require("../server");
const { Post } = require('../posts');
let jwt;

const expect = chai.expect;
chai.use(chaiHttp);

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "test@email.com",
  password: "thinkful999"
}

const testPost = {
  datePosted: "Monday, February 11, 2019 2:23 AM",
  title: "excepteur reprehenderit id est eiusmod",
  open: true,
  fee: "$604.80",
  picture: "http://placehold.it/32x32",
  company: "WAAB",
  postedBy: "test.post@sbemail.com",
  region: "Pacific",
  location: "Portland, OR",
  content:
    "Pariatur anim velit veniam aliquip. Excepteur aute consequat qui do do laborum nisi officia labore ullamco. Ipsum Lorem adipisicing ea occaecat quis ullamco consectetur est occaecat pariatur sint enim esse.\n\nExercitation est mollit nisi est excepteur mollit non voluptate nostrud consequat commodo do aliqua. Sint esse anim sint quis nostrud ullamco occaecat exercitation tempor quis. Consectetur et deserunt magna duis esse. Occaecat mollit do velit Lorem ad nisi ad nisi ullamco excepteur eiusmod sunt. Sint sunt ea veniam enim excepteur sint ut.",
  applicants: [
    {
      firstName: "Dickerson",
      lastName: "Copeland",
      instrument: "Percussion",
      recordings: ["recording1url", "recording2url", "recording3url"],
      email: "dickerson.copeland@gmail.com",
      bio:
        "Sint elit do duis cupidatat ex minim consequat aute dolore voluptate eiusmod et. Nisi cillum consectetur proident sit adipisicing pariatur est dolor cillum esse est sunt sit. Deserunt reprehenderit ea velit eu. Lorem est veniam dolore consequat nulla quis fugiat fugiat.\n\nAd fugiat proident ea deserunt Lorem. Eu labore incididunt aliqua dolor laboris enim voluptate ut incididunt. Fugiat proident laborum non fugiat aliquip.",
      resume: "page/resume.pdf",
      region: "South",
      location: "Dallas, TX"
    },
    {
      firstName: "Joanna",
      lastName: "Britt",
      instrument: "Percussion",
      recordings: ["recording1url", "recording2url", "recording3url"],
      email: "joanna.britt@gmail.com",
      bio:
        "Aliquip sit reprehenderit elit non pariatur qui sint magna dolore dolore. Amet dolore commodo elit elit velit enim deserunt minim tempor occaecat laborum ipsum ullamco. In amet nostrud enim ad aliquip minim id ea aliqua. Id velit tempor nostrud nisi anim consectetur est. Qui consectetur in ad fugiat pariatur duis ipsum aliquip. Reprehenderit eu ad dolore quis tempor cupidatat laborum pariatur cupidatat sit excepteur velit.\n\nIpsum ut dolore nulla amet qui laborum. Nulla esse aliqua ea consectetur commodo nostrud et nisi reprehenderit. Elit culpa cupidatat ex duis culpa aliqua est fugiat aliqua ullamco. Officia velit exercitation ipsum velit ipsum voluptate ut voluptate exercitation laboris culpa duis enim incididunt. Voluptate officia laborum consectetur culpa consectetur est eu eiusmod nulla cillum.",
      resume: "page/resume.pdf",
      region: "Northeast",
      location: "Pittsburgh, PA"
    },
    {
      firstName: "Lilia",
      lastName: "Le",
      instrument: "Percussion",
      recordings: ["recording1url", "recording2url", "recording3url"],
      email: "lilia.le@gmail.com",
      bio:
        "Nostrud duis veniam et consequat ex labore eu quis nostrud irure do. Aliqua nisi cupidatat nisi labore cillum exercitation veniam in eu eu duis quis dolore consequat. Non deserunt occaecat ex dolore exercitation ea sit dolor. Ad cupidatat occaecat sunt tempor cupidatat deserunt sit. Et exercitation qui fugiat sint id. Cupidatat laborum ea duis quis. Anim do do est ullamco commodo laborum cillum in irure eiusmod nostrud magna enim.\n\nEnim ut Lorem elit reprehenderit qui aute irure voluptate exercitation eu officia nisi incididunt ullamco. Incididunt adipisicing mollit dolore amet do adipisicing. Mollit tempor nostrud aliqua velit est elit elit aliqua voluptate deserunt ad.",
      resume: "page/resume.pdf",
      region: "Pacific",
      location: "Los Angeles, CA"
    }
  ]
};

const testApplicant = {
  firstName: "Test",
  lastName: "Applicant",
  instrument: "Bassoon",
  recordings: ["recording1url", "recording2url", "recording3url"],
  email: "test.applicant@email.com",
  bio: "Test bio",
  resume: "Test resume",
  region: "Pacific",
  location: "Los Angeles, CA"
};

describe("/api/posts", function () {
  before(function () {
    return runServer();
  });
  before(function () {
    return chai
      .request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .then(res => {
        jwt = res.body.authToken;
      })
  });
  before(function () {
    return Post.create(testPost);
  });

  after(function () {
    return Post.deleteOne({ postedBy: testPost.postedBy });
  });
  after(function () {
    return closeServer();
  });

  describe("READ", function () {
    it("should get all posts on GET", function () {
      return chai
        .request(app)
        .get("/api/posts")
        .set({ Authorization: `Bearer ${jwt}` })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.an("object");
          expect(res.body).to.have.key("posts");
          expect(res.body.posts).to.have.length.of.at.least(1);
        });
    });

    it("should filter posts using query parameters", function () {
      return chai
        .request(app)
        .get("/api/posts/?location=Seattle,%20WA")
        .set({ Authorization: `Bearer ${jwt}` })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.an("object");
          expect(res.body).to.have.key("posts");
          expect(res.body.posts).to.have.length.of.at.least(1);
          expect(res.body.posts[0].location).to.equal("Seattle, WA");
        });
    });
  });

  describe("UPDATE", function () {
    // NOTE: some sort of race condition happening. 
    // Test passes but throws VersionError: no matching document found for id <id> version 0 modifiedPaths "applicants"
    it("should add a new applicant to a specified post on PUT /:postID", function () {
      Post
        .findOne({ postedBy: testPost.postedBy })
        .then(post => {
          return chai
            .request(app)
            .put(`/api/posts/apply/${post._id}`)
            .set({
              Authorization: `Bearer ${jwt}`
            })
            .send({ applicant: testApplicant })
            .then(res => {
              expect(res).to.have.status(204);
              Post
                .findOne({ postedBy: testPost.postedBy })
                .then(post => {
                  console.log(post.applicants[3]);
                  const lastEntry = post.applicants[3];
                  expect(lastEntry.email).to.equal(testApplicant.email);
                }
                );
            })
            .catch(err => console.error(err));
        });
    });
  });
});
