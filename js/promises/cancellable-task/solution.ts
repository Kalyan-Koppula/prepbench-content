interface CancellableOptions {
  signal?: AbortSignal
  timeout?: number
}

function namedError(name: string, message: string) {
  const error = new Error(message)
  error.name = name
  return error
}

function cancellable<T>(task: (signal: AbortSignal) => T | PromiseLike<T>, options: CancellableOptions = {}): Promise<T> {
  const { signal, timeout } = options
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(namedError('AbortError', 'The operation was aborted'))
      return
    }

    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined

    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
    const stop = (error: Error) => {
      cleanup()
      controller.abort(error)
      reject(error)
    }
    const onAbort = () => stop(namedError('AbortError', 'The operation was aborted'))

    signal?.addEventListener('abort', onAbort)
    if (timeout !== undefined) timer = setTimeout(() => stop(namedError('TimeoutError', `Timed out after ${timeout}ms`)), timeout)

    let result: Promise<T>
    try {
      result = Promise.resolve(task(controller.signal))
    } catch (error) {
      cleanup()
      reject(error)
      return
    }
    result.then(
      (value) => {
        cleanup()
        resolve(value)
      },
      (error) => {
        cleanup()
        reject(error)
      },
    )
  })
}
