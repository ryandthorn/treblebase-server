const chai = require("chai");
const chaiHttp = require("chai-http");
const { app } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("API", function() {
  it("should return status 404 on GET requests to undefined endpoints", function() {
    return chai
      .request(app)
      .get("/api/fooooo")
      .then(function(res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body.message).to.equal("Not Found");
      });
  });
});
