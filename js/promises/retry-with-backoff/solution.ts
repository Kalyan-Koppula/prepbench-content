interface RetryOptions {
  attempts?: number
  delay?: number
  factor?: number
  maxDelay?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function retry<T>(fn: (attempt: number) => T | Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { attempts = 3, delay = 100, factor = 2, maxDelay = Infinity, shouldRetry = () => true } = options
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt)
    } catch (error) {
      if (attempt >= attempts || !shouldRetry(error, attempt)) throw error
      await sleep(Math.min(delay * factor ** (attempt - 1), maxDelay))
    }
  }
}
