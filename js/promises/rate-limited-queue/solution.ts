interface Job {
  task: () => unknown
  resolve: (value: any) => void
  reject: (reason: unknown) => void
}

function createRateLimiter(limit: number, windowMs: number) {
  const starts: number[] = [] // start times still inside the window, oldest first
  const queue: Job[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

  const run = (job: Job) => {
    try {
      Promise.resolve(job.task()).then(job.resolve, job.reject)
    } catch (error) {
      job.reject(error)
    }
  }

  const drain = () => {
    timer = undefined
    const now = Date.now()
    while (starts.length > 0 && starts[0] + windowMs <= now) starts.shift()
    while (queue.length > 0 && starts.length < limit) {
      starts.push(now)
      run(queue.shift()!)
    }
    if (queue.length > 0) timer = setTimeout(drain, starts[0] + windowMs - now)
  }

  return function schedule<T>(task: () => T | PromiseLike<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push({ task, resolve, reject })
      // While a timer is pending the window is full; the timer will drain the queue.
      if (timer === undefined) drain()
    })
  }
}
