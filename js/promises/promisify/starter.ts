type NodeCallback = (error: unknown, value?: unknown) => void

function promisify(fn: (...args: any[]) => void) {
  return function (this: unknown, ...args: unknown[]): Promise<unknown> {
    // TODO
  }
}
