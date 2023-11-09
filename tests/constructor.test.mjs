// bluebird https://github.com/petkaantonov/bluebird/blob/master/test/mocha/constructor.js
import { describe, it } from "node:test";
import assert from "node:assert";
import { PinkyPromise } from "../dist/pinky-promise.js";

export function deferred() {
  let resolve, reject;
  const promise = new PinkyPromise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

function fulfills(value, test) {
  it("immediately-fulfilled", function (t) {
    return test(
      new PinkyPromise(function (resolve) {
        resolve(value);
      }),
    );
  });

  it("eventually-fulfilled", function () {
    return test(
      new PinkyPromise(function (resolve) {
        setTimeout(function () {
          resolve(value);
        }, 1);
      }),
    );
  });
}

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

function testFulfilled(value, test) {
  describe("immediate value", function () {
    fulfills(value, test);
  });

  describe("already fulfilled promise for value", function () {
    fulfills(new PinkyPromise((resolve) => resolve(value)), test);
  });

  describe("immediately fulfilled promise for value", function () {
    var a = deferred();
    fulfills(a.promise, test);
    a.resolve(value);
  });

  describe("eventually fulfilled promise for value", function () {
    var a = deferred();
    fulfills(a.promise, test);
    setTimeout(function () {
      a.resolve(value);
    }, 1);
  });

  describe("synchronous thenable for value", function () {
    fulfills(
      {
        then: function (f) {
          f(value);
        },
      },
      test,
    );
  });

  describe("asynchronous thenable for value", function () {
    fulfills(
      {
        then: function (f) {
          setTimeout(function () {
            f(value);
          }, 1);
        },
      },
      test,
    );
  });
}

function testRejected(reason, test) {
  describe("immediate reason", function () {
    rejects(reason, test);
  });
}

describe("PinkyPromise constructor", function () {
  it("should throw type error when called as function", function () {
    try {
      PinkyPromise(function () {});
    } catch (e) {
      return;
    }
    assert.fail();
  });

  it("should throw type error when passed non-function", function () {
    try {
      new PinkyPromise({});
    } catch (e) {
      return;
    }
    assert.fail();
  });

  var defaultThis = (function () {
    return this;
  })();

  it("calls the resolver as a function", function (t) {
    new PinkyPromise(function () {
      assert(this === defaultThis);
    });
  });

  it("passes arguments even if parameters are not defined", function (t) {
    new PinkyPromise(function () {
      assert(arguments.length === 2 || arguments.length === 3);
    });
  });

  it("should reject with any thrown error", function (t) {
    var e = new Error();
    return new PinkyPromise(function () {
      throw e;
    }).then(assert.fail, function (err) {
      assert(err === e);
    });
  });

  it("should call the resolver function synchronously", function (t) {
    var e = new Error();
    var a = 0;
    new PinkyPromise(function () {
      a = 1;
    });
    assert(a === 1);
  });

  describe("resolves the promise with the given object value", function () {
    var value = {};
    testFulfilled(value, function (promise) {
      return promise.then(function (v) {
        assert(v === value);
      });
    });
  });

  describe("resolves the promise with the given primitive value", function () {
    var value = 3;
    testFulfilled(value, function (promise) {
      return promise.then(function (v) {
        console.log(
          `resolves primitive ${v} ${value}, equals = ${
            v === value
          }, promise=${promise}`,
        );
        assert(v === value);
      });
    });
  });

  describe("resolves the promise with the given undefined value", function () {
    var value = void 0;
    testFulfilled(value, function (promise) {
      return promise.then(function (v) {
        assert(v === value);
      });
    });
  });

  describe("rejects the promise with the given object reason", function () {
    var reason = {};
    testRejected(reason, function (promise) {
      return promise.then(assert.fail, function (v) {
        assert(v === reason);
      });
    });
  });

  describe("rejects the promise with the given primitive reason", function () {
    var reason = 3;
    testRejected(reason, function (promise) {
      return promise.then(assert.fail, function (v) {
        assert(v === reason);
      });
    });
  });

  describe("rejects the promise with the given undefined reason", function () {
    var reason = void 0;
    testRejected(reason, function (promise) {
      return promise.then(assert.fail, function (v) {
        assert(v === reason);
      });
    });
  });
});
