import { describe, it } from "node:test";
import assert from "node:assert";
import { PinkyPromise } from "../dist/pinky-promise.js";

function rejects(reason, test) {
  it("immediately-rejected", function () {
    return test(
      new PinkyPromise(function (resolve, reject) {
        reject(reason);
      }),
    );
  });

  it("eventually-rejected", function () {
    return test(
      new PinkyPromise(function (resolve, reject) {
        setTimeout(function () {
          reject(reason);
        }, 1);
      }),
    );
  });
}

function testRejected(reason, test) {
  describe("immediate reason", function () {
    rejects(reason, test);
  });
}

describe("PinkyPromise .catch method", function () {
  it("should throw type error when called as function", function () {
    try {
      PinkyPromise(function () {});
    } catch (e) {
      return;
    }
    assert.fail();
  });

  describe("rejects the promise with the given object reason", function () {
    var reason = {};
    testRejected(reason, function (promise) {
      return promise.catch(function (v) {
        assert(v === reason);
      });
    });
  });

  describe("rejects the promise with the given primitive reason", function () {
    var reason = 3;
    testRejected(reason, function (promise) {
      return promise.catch(function (v) {
        assert(v === reason);
      });
    });
  });

  describe("rejects the promise with the given undefined reason", function () {
    var reason = void 0;
    testRejected(reason, function (promise) {
      return promise.catch(function (v) {
        assert(v === reason);
      });
    });
  });
});
