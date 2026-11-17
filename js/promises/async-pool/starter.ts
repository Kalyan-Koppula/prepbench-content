function asyncPool<T>(tasks: (() => T | PromiseLike<T>)[], limit: number): Promise<T[]> {
  // TODO
}
