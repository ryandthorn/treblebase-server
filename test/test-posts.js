"use strict";
global.TEST_DATABASE_URL = "mongodb://localhost/test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, runServer, closeServer } = require("../server");
const { Post } = require("../posts");

const expect = chai.expect;
chai.use(chaiHttp);

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
      resumeUrl: "page/resume.pdf",
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
      resumeUrl: "page/resume.pdf",
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
      resumeUrl: "page/resume.pdf",
      region: "Pacific",
      location: "Los Angeles, CA"
    }
  ]
};

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

  // describe("/apply", function() {
  //   beforeEach(function() {
  //     Post.create(testPost);
  //   });
  //   afterEach(function() {
  //     Post.deleteOne({ postedBy: "test.post@sbemail.com" });
  //   });

  //   it("should add a new applicant to a specified post on PUT /:postID", function() {
  //     Post.findOne({ postedBy: "test.post@sbemail.com" }).then(testPost => {
  //       return chai
  //         .request(app)
  //         .put(`/api/posts/apply/${testPost._id}`)
  //         .set({
  //           Authorization:
  //             "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoiYXNkZkBoZWxsby5jb20ifSwiaWF0IjoxNTUzNDgyOTg4LCJleHAiOjMxMDY5Njk1MjMsInN1YiI6ImFzZGZAaGVsbG8uY29tIn0.gBIOUIW30Ns3gWEiDsjSz3Vc_whGUz0gXvyBM5MgE0g",
  //           ContentType: "application/json"
  //         })
  //         .send(
  //           JSON.stringify({
  //             id: testPost._id,
  //             applicant: {
  //               firstName: "Jane",
  //               lastName: "Doe",
  //               instrument: "Violin",
  //               recordings: ["recording1url", "recording2url", "recording3url"],
  //               email: "concerto999@gmail.com",
  //               bio:
  //                 "Proident pariatur elit adipisicing dolore. Velit fugiat dolor nulla enim dolor irure. Cupidatat eu reprehenderit quis labore ea officia. Officia tempor enim labore laborum ipsum ex labore tempor ut occaecat.\n\nId duis fugiat non minim ipsum in do. Mollit aliquip reprehenderit quis ullamco in eiusmod sunt. Pariatur voluptate occaecat tempor elit reprehenderit anim. Qui voluptate ut excepteur irure veniam proident ea. Adipisicing minim ipsum elit irure reprehenderit id ullamco tempor cillum.",
  //               resumeUrl: "page/resume.pdf",
  //               region: "NYC",
  //               location: "New York, NY"
  //             }
  //           })
  //         )
  //         .then(res => {
  //           expect(res).to.have.status(204);

  //           Post.findOne({ postedBy: "test.post@sbemail.com" }).then(
  //             testPost => {
  //               expect(testPost.applicants[applicants.length].email).to.equal(
  //                 "concerto999@gmail.com"
  //               );
  //             }
  //           );
  //         })
  //         .catch(err => console.error(err));
  //     });
  //   });
  // });
});
