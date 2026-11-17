class History<T> {
  constructor(initial: T, options: { limit?: number } = {}) {
    // TODO
  }

  get value(): T {
    // TODO
    return undefined as T
  }

  push(next: T): void {
    // TODO
  }

  undo(): T {
    // TODO
    return undefined as T
  }

  redo(): T {
    // TODO
    return undefined as T
  }

  canUndo(): boolean {
    // TODO
    return false
  }

  canRedo(): boolean {
    // TODO
    return false
  }
}
