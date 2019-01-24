const expect = require("chai").expect;
const { provideData } = require("../src/app.js");

describe("provideData", function() {
  it("should return status code 200 for /", function(done) {
    const send = function(res, content, statusCode) {
      expect(statusCode).to.equal(200);
      done();
    };
    const res = {};
    const req = { method: "GET", url: "/" };
    const next = () => {};
    provideData(req, res, next, send);
  });

  it("should return status code 404 for missing paths", function(done) {
    const send = function(res, content, statusCode) {
      expect(statusCode).to.equal(404);
      done();
    };
    const res = {};
    const req = { method: "GET", url: "/badPath" };
    const next = () => {};
    provideData(req, res, next, send);
  });
});
