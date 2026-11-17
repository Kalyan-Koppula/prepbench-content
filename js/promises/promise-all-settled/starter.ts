type Outcome<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }

function promiseAllSettled<T>(iterable: Iterable<T | PromiseLike<T>>): Promise<Outcome<T>[]> {
  // TODO
}
