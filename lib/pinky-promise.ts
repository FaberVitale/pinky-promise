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
  | { status: "rejected"; reason: unknown }
>;

export class PinkyPromise<T> {
  #state: PromiseState<T> = { status: "pending" };
}
