function promiseFinally<T>(promise: PromiseLike<T>, onFinally?: (() => unknown) | null): Promise<T> {
  if (typeof onFinally !== 'function') return Promise.resolve(promise)
  const callback = onFinally
  return Promise.resolve(promise).then(
    (value) => Promise.resolve(callback()).then(() => value),
    (reason) =>
      Promise.resolve(callback()).then(() => {
        throw reason
      }),
  )
}
