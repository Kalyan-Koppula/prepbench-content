type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void

class MyPromise<T> {
  private state: 'pending' | 'fulfilled' | 'rejected' = 'pending'
  private result: unknown = undefined
  private callbacks: (() => void)[] = []

  constructor(executor: Executor<T>) {
    let done = false
    const resolve = (value: unknown) => {
      if (done) return
      done = true
      this.adopt(value)
    }
    const reject = (reason: unknown) => {
      if (done) return
      done = true
      this.settle('rejected', reason)
    }
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  // Follow thenables; settle directly with anything else.
  private adopt(value: unknown) {
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      let then: unknown
      try {
        then = (value as { then?: unknown }).then
      } catch (error) {
        this.settle('rejected', error)
        return
      }
      if (typeof then === 'function') {
        let called = false
        try {
          then.call(
            value,
            (v: unknown) => {
              if (called) return
              called = true
              this.adopt(v)
            },
            (r: unknown) => {
              if (called) return
              called = true
              this.settle('rejected', r)
            },
          )
        } catch (error) {
          if (!called) {
            called = true
            this.settle('rejected', error)
          }
        }
        return
      }
    }
    this.settle('fulfilled', value)
  }

  private settle(state: 'fulfilled' | 'rejected', result: unknown) {
    if (this.state !== 'pending') return
    this.state = state
    this.result = result
    const waiting = this.callbacks
    this.callbacks = []
    for (const run of waiting) queueMicrotask(run)
  }

  then(onFulfilled?: ((value: T) => unknown) | null, onRejected?: ((reason: unknown) => unknown) | null): MyPromise<any> {
    return new MyPromise((resolve, reject) => {
      const run = () => {
        const fulfilled = this.state === 'fulfilled'
        const handler = fulfilled ? onFulfilled : onRejected
        if (typeof handler !== 'function') {
          if (fulfilled) resolve(this.result)
          else reject(this.result)
          return
        }
        try {
          resolve((handler as (x: unknown) => unknown)(this.result))
        } catch (error) {
          reject(error)
        }
      }
      if (this.state === 'pending') this.callbacks.push(run)
      else queueMicrotask(run)
    })
  }

  catch(onRejected?: ((reason: unknown) => unknown) | null): MyPromise<any> {
    return this.then(null, onRejected)
  }

  finally(onFinally?: (() => unknown) | null): MyPromise<T> {
    if (typeof onFinally !== 'function') return this.then()
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason
        }),
    )
  }

  static resolve<U>(value: U | PromiseLike<U>): MyPromise<U> {
    if (value instanceof MyPromise) return value
    return new MyPromise<U>((resolve) => resolve(value))
  }

  static reject(reason?: unknown): MyPromise<never> {
    return new MyPromise<never>((_, reject) => reject(reason))
  }
}
