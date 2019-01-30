const chai = require("chai");

const {
  provideData,
  getRequest,
  parseData,
  parseLoginData
} = require("../src/app.js");

describe("provideData", function() {
  it("should return status code 200 for '/'", function(done) {
    const send = function(res, content, statusCode) {
      chai.expect(statusCode).to.equal(200);
      done();
    };
    const res = {};
    const req = { method: "GET", url: "/" };
    const next = () => {};
    provideData(req, res, next, send);
  });

  it("should return status code 404 for missing paths", function(done) {
    const send = function(res, content, statusCode) {
      chai.expect(statusCode).to.equal(404);
      done();
    };
    const res = {};
    const req = { method: "GET", url: "/badPath" };
    const next = () => {};
    provideData(req, res, next, send);
  });
});

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

describe("parseData", function() {
  const userDetails = "userId=vprince001&password=12345";
  it("should return value of userId from userDetails", function() {
    const expected = "vprince001";
    chai.expect(parseData(userDetails, 0)).to.equal(expected);
  });

  it("should return value of password from userDetails", function() {
    const expected = "12345";
    chai.expect(parseData(userDetails, 1)).to.equal(expected);
  });
});

describe("parseLoginData", function() {
  const req = { body: "userId=vprince001&password=12345" };

  it("should return userId and password in object for userDetails", function() {
    const expected = { USERID: "vprince001", PASSWORD: "12345" };
    chai.assert.deepEqual(parseLoginData(req), expected);
  });
});
