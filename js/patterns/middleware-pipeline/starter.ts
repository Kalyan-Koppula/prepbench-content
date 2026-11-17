type Next = () => Promise<void>
type Middleware<C> = (ctx: C, next: Next) => void | Promise<void>

class Pipeline<C = any> {
  use(middleware: Middleware<C>): this {
    // TODO
    return this
  }

  run(ctx: C): Promise<C> {
    // TODO
    return Promise.resolve(ctx)
  }
}
