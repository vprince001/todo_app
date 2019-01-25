const chai = require("chai");
const { isMatching } = require("../src/frameWork.js");

describe("isMatching", function() {
  it("should return true if req method and route url is not present", function() {
    const route = {};
    const req = {};
    chai.expect(isMatching(req, route)).to.equal(true);
  });

  it("should return true if route method is present and req method is equal to route method", function() {
    const route = { method: "GET" };
    const req = { method: "GET" };
    chai.expect(isMatching(req, route)).to.equal(true);
  });

  it("should return true if route url is present and req url is equal to route url", function() {
    const route = { url: "/login" };
    const req = { url: "/login" };
    chai.expect(isMatching(req, route)).to.equal(true);
  });

  it("should return false if route method is present and req method is not equal to route method", function() {
    const route = { method: "GET" };
    const req = {};
    chai.expect(isMatching(req, route)).to.equal(false);
  });

  it("should return false if route url is present and req url is not equal to route url", function() {
    const route = { method: "GET" };
    const req = {};
    chai.expect(isMatching(req, route)).to.equal(false);
  });
});
