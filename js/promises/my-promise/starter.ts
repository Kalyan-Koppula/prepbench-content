type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void

class MyPromise<T> {
  constructor(executor: Executor<T>) {
    // TODO
  }

  then(onFulfilled?: ((value: T) => unknown) | null, onRejected?: ((reason: unknown) => unknown) | null): MyPromise<any> {
    // TODO
  }

  catch(onRejected?: ((reason: unknown) => unknown) | null): MyPromise<any> {
    // TODO
  }

  finally(onFinally?: (() => unknown) | null): MyPromise<T> {
    // TODO
  }

  static resolve<U>(value: U | PromiseLike<U>): MyPromise<U> {
    // TODO
  }

  static reject(reason?: unknown): MyPromise<never> {
    // TODO
  }
}
