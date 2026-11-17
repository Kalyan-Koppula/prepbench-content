interface PollOptions {
  interval?: number
  factor?: number
  maxInterval?: number
  timeout?: number
}

function pollUntil<T>(fn: () => T | PromiseLike<T>, predicate: (result: T) => boolean, options: PollOptions = {}): Promise<T> {
  const { interval = 100, factor = 1, maxInterval = Infinity, timeout = Infinity } = options
  return new Promise<T>((resolve, reject) => {
    let done = false
    let waits = 0
    let waitTimer: ReturnType<typeof setTimeout> | undefined
    let deadline: ReturnType<typeof setTimeout> | undefined

    const finish = (settle: () => void) => {
      if (done) return
      done = true
      clearTimeout(waitTimer)
      clearTimeout(deadline)
      settle()
    }

    if (Number.isFinite(timeout)) {
      deadline = setTimeout(() => {
        const error = new Error(`Polling timed out after ${timeout}ms`)
        error.name = 'TimeoutError'
        finish(() => reject(error))
      }, timeout)
    }

    const poll = () => {
      let attempt: Promise<T>
      try {
        attempt = Promise.resolve(fn())
      } catch (error) {
        attempt = Promise.reject(error)
      }
      attempt
        .then((result) => {
          if (done) return
          if (predicate(result)) {
            finish(() => resolve(result))
            return
          }
          const wait = Math.min(interval * factor ** waits, maxInterval)
          waits += 1
          waitTimer = setTimeout(poll, wait)
        })
        .catch((error) => finish(() => reject(error)))
    }

    poll()
  })
}
