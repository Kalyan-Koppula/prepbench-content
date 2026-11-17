interface RetryOptions {
  attempts?: number
  delay?: number
  factor?: number
  maxDelay?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
}

async function retry<T>(fn: (attempt: number) => T | Promise<T>, options: RetryOptions = {}): Promise<T> {
  // TODO
}
