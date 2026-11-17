interface PollOptions {
  interval?: number
  factor?: number
  maxInterval?: number
  timeout?: number
}

function pollUntil<T>(fn: () => T | PromiseLike<T>, predicate: (result: T) => boolean, options: PollOptions = {}): Promise<T> {
  // TODO
}
