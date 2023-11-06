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
  | { status: "pending" }
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any }
>;

/**
 * The callback passed as argument of PinkyPromise constructor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise
 * @see https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-constructor
 */
export type PinkyPromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void;

export class PinkyPromise<T> {
  #state: PromiseState<T> = { status: "pending" };

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

  #resolve = (value: T | PromiseLike<T>) => {};

  #reject = (reason: unknown) => {};
}
