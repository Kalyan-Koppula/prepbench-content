type NodeCallback = (error: unknown, value?: unknown) => void

function promisify(fn: (...args: any[]) => void) {
  return function (this: unknown, ...args: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const callback: NodeCallback = (error, value) => {
        if (error) reject(error)
        else resolve(value)
      }
      // A synchronous throw inside the executor rejects the promise for us.
      fn.call(this, ...args, callback)
    })
  }
}
