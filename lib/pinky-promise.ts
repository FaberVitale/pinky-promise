/**
 * A Promise is in one of these states:
 *
 * - pending: initial state, neither fulfilled nor rejected.
 * - fulfilled: meaning that the operation was completed successfully.
 * - rejected: meaning that the operation failed.
 *
 * @see https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects
 * @see https://promisesaplus.com/#promise-states
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#description
 */
type PromiseState<T> =
  | { readonly status: "pending" }
  | { readonly status: "fulfilled"; readonly value: T }
  | { readonly status: "rejected"; readonly reason: any };

/**
 * The callback passed as argument of PinkyPromise constructor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise
 * @see https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-constructor
 */
export type PinkyPromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void;

/**
 * A [Promise A+](https://promisesaplus.com/) spec compliant implementation written in typescript.
 */
export class PinkyPromise<T> implements PromiseLike<T> {
  /**
   * Creates a new resolved promise.
   * @returns A resolved promise.
   */
  static resolve(): PinkyPromise<void>;
  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  static resolve<U>(value: U): PinkyPromise<Awaited<U>>;
  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  static resolve<U>(value: U | PromiseLike<U>): PinkyPromise<Awaited<U>>;
  static resolve(value?: any): PinkyPromise<any> {
    return new PinkyPromise((resolve) => resolve(value));
  }

  /**
   * Creates a new rejected promise for the provided reason.
   * @param reason The reason the promise was rejected.
   * @returns A new rejected Promise.
   */
  static reject<U = never>(reason?: any): PinkyPromise<U> {
    return new PinkyPromise((_, reject) => reject(reason));
  }

  #state: PromiseState<T> = { status: "pending" };
  #fulfilledListeners: ((value: unknown) => unknown)[] = [];
  #rejectedListeners: ((reason: unknown) => unknown)[] = [];

  constructor(executor: PinkyPromiseExecutor<T>) {
    if (typeof executor !== "function") {
      throw new TypeError(`${executor} is not a function`);
    }

    try {
      executor(this.#resolve, this.#reject);
    } catch (executorError) {
      this.#reject(executorError);
    }
  }

  /**
   * Notifies the subscribed listeners if the promise is settled.
   */
  #notify() {
    switch (this.#state.status) {
      case "pending":
        break;
      case "fulfilled": {
        this.#fulfilledListeners.forEach((listener) =>
          queueMicrotask(() =>
            listener((this.#state as { status: "fulfilled"; value: T }).value),
          ),
        );
        break;
      }
      case "rejected": {
        this.#rejectedListeners.forEach((listener) =>
          queueMicrotask(() =>
            listener(
              (this.#state as { status: "rejected"; reason: any }).reason,
            ),
          ),
        );
        break;
      }
    }

    if (this.#state.status !== "pending") {
      this.#fulfilledListeners.splice(0, this.#fulfilledListeners.length);
      this.#rejectedListeners.splice(0, this.#rejectedListeners.length);
    }
  }

  /**
   * Settles promise, transitioning it from state pending to either `fulfilled` or `rejected`.
   *
   * Triggers thenable listeners when the state is updated.
   */
  static #transition(
    pinkyPromise: PinkyPromise<any>,
    state: PromiseState<any>,
  ) {
    console.log("#transition", state.status, state);
    if (pinkyPromise.#state.status === "pending") {
      pinkyPromise.#state = state;
      pinkyPromise.#notify();
    }
  }

  /**
   * Promise resolution procedure.
   * @see https://promisesaplus.com/#the-promise-resolution-procedure
   */
  static #unpack(pinkyPromise: PinkyPromise<any>, value: unknown) {
    console.log("#unpack", pinkyPromise.#state.status, value);
    if (pinkyPromise.#state.status !== "pending") {
      return;
    }

    if (Object.is(value, pinkyPromise)) {
      PinkyPromise.#transition(pinkyPromise, {
        status: "rejected",
        reason: new TypeError("Chaining cycle detected for promise"),
      });
      return;
    }

    if (value instanceof PinkyPromise) {
      try {
        value.then(
          (val) => PinkyPromise.#unpack(pinkyPromise, val),
          (reason) =>
            PinkyPromise.#transition(pinkyPromise, {
              status: "rejected",
              reason,
            }),
        );
      } catch (reason) {
        PinkyPromise.#transition(pinkyPromise, {
          status: "rejected",
          reason,
        });
      }

      return;
    }

    if (value && (typeof value === "function" || typeof value === "object")) {
      let then: Function | undefined;
      try {
        then = (value as PromiseLike<any>).then;
      } catch (reason) {
        PinkyPromise.#transition(pinkyPromise, { status: "rejected", reason });
        return;
      }

      if (typeof then === "function") {
        let called = false;
        try {
          then.call(
            value,
            (val: any) => {
              if (!called) {
                called = true;
                PinkyPromise.#unpack(pinkyPromise, val);
              }
            },
            (reason: any) => {
              if (!called) {
                called = true;
                PinkyPromise.#transition(pinkyPromise, {
                  status: "rejected",
                  reason,
                });
              }
            },
          );
        } catch (reason) {
          if (!called) {
            called = true;
            PinkyPromise.#transition(pinkyPromise, {
              status: "rejected",
              reason,
            });
          }
        }

        return;
      } else {
        PinkyPromise.#transition(pinkyPromise, { status: "fulfilled", value });
      }
    } else {
      PinkyPromise.#transition(pinkyPromise, { status: "fulfilled", value });
    }
  }

  /**
   * Runs `then` `callback` when a promise settles.
   */
  static #run(
    value: unknown,
    promise: PinkyPromise<any>,
    callback: Function,
  ): void {
    console.log("#run", promise.#state.status, value);
    let resolvable: PromiseLike<unknown> | unknown;

    try {
      resolvable = callback(value);
    } catch (reason) {
      PinkyPromise.#transition(promise, { status: "rejected", reason });
      return;
    }

    PinkyPromise.#unpack(promise, resolvable);
  }

  /**
   * Callback passed to the Promise executor.
   * @see https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-resolve-functions
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise#resolver_function
   */
  #resolve = (value: T | PromiseLike<T>): void => {
    console.log("#resolve", value, this.#state.status);
    PinkyPromise.#unpack(this, value);
  };

  /**
   * Callback passed to the Promise executor.
   */
  #reject = (reason: unknown): void => {
    console.log("#reject", reason, this.#state.status);
    PinkyPromise.#transition(this, { status: "rejected", reason });
  };

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): PinkyPromise<TResult1 | TResult2> {
    const that = this;

    const output = new PinkyPromise<TResult1 | TResult2>((resolve, reject) => {
      if (typeof onfulfilled === "function") {
        that.#fulfilledListeners.push((value) => {
          console.log("onfulfilled", value, that.#state.status);
          PinkyPromise.#run(value, output, onfulfilled);
        });
      } else {
        that.#fulfilledListeners.push(resolve as any);
      }

      if (typeof onrejected === "function") {
        that.#rejectedListeners.push((reason: any) => {
          console.log("onrejected", reason, that.#state.status);
          PinkyPromise.#run(reason, output, onrejected);
        });
      } else {
        that.#rejectedListeners.push(reject);
      }

      that.#notify();
    });

    return output;
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): PinkyPromise<T | TResult> {
    return this.then<T, TResult>(undefined, onrejected);
  }
}
