const chai = require("chai");

const { getRequest } = require("../src/app.js");

describe("getRequest", function() {
  it("should return index file path for '/' ", function() {
    const expected = "./public/htmls/index.html";
    chai.expect(getRequest("/")).to.equal(expected);
  });

  it("should return given string after adding ./public except for '/' ", function() {
    const expected = "./public/favicon.ico";
    chai.expect(getRequest("/favicon.ico")).to.equal(expected);
  });
});
