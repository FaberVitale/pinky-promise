"use strict";
const { PinkyPromise } = require("../dist/pinky-promise.cjs");

module.exports = {
  deferred() {
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
  },
};
