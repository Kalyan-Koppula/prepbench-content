interface CancellableOptions {
  signal?: AbortSignal
  timeout?: number
}

function cancellable<T>(task: (signal: AbortSignal) => T | PromiseLike<T>, options: CancellableOptions = {}): Promise<T> {
  // TODO
}
