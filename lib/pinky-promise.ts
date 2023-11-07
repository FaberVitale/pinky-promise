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
type PromiseState<T> = Readonly<
  | { status: "pending"; thenable?: PromiseLike<T> }
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any }
>;

type OnFulfill<T> = NonNullable<Parameters<PromiseLike<T>["then"]>["0"]>;
type OnReject = NonNullable<Parameters<PromiseLike<unknown>["then"]>["1"]>;

/**
 * The callback passed as argument of PinkyPromise constructor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise
 * @see https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-constructor
 */
export type PinkyPromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void;

function isThenable<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).then === "function"
  );
}

export class PinkyPromise<T> {
  #state: PromiseState<T> = { status: "pending" };
  #fulfilledListeners: OnFulfill<T>[] = [];
  #rejectedListeners: OnReject[] = [];

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

  #verifyState() {
  }

  /**
   * Callback passed to the Promise executor
   * @see https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-resolve-functions
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise#resolver_function
   */
  #resolve = (value: T | PromiseLike<T>): void => {
    if (this.#state.status === "pending" && !this.#state.thenable) {
      if (isThenable(value)) {
        // throw exception to avoid loops
        if (Object.is(value, this)) {
          throw new TypeError("Chaining cycle detected for promise");
        }

        value.then(this.#resolve, this.#reject);
      } else {
        this.#state = { status: "fulfilled", value };
      }

      this.#verifyState();
    }
  };

  #reject = (reason: unknown): void => {
    if (this.#state.status === "pending" && !this.#state.thenable) {
      this.#state = { status: "rejected", reason };
      this.#verifyState();
    }
  };
}
