type Next = () => Promise<void>
type Middleware<C> = (ctx: C, next: Next) => void | Promise<void>

class Pipeline<C = any> {
  private stack: Middleware<C>[] = []

  use(middleware: Middleware<C>): this {
    this.stack.push(middleware)
    return this
  }

  run(ctx: C): Promise<C> {
    const stack = [...this.stack]
    let lastIndex = -1

    const dispatch = (i: number): Promise<void> => {
      if (i <= lastIndex) return Promise.reject(new Error('next() called multiple times'))
      lastIndex = i
      const middleware = stack[i]
      if (!middleware) return Promise.resolve()
      try {
        return Promise.resolve(middleware(ctx, () => dispatch(i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return dispatch(0).then(() => ctx)
  }
}
