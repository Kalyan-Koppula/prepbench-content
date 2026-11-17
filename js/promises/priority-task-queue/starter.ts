class TaskQueue {
  add<T>(task: () => T | PromiseLike<T>, priority = 0): Promise<T> {
    // TODO
  }

  get size(): number {
    // TODO
  }
}
