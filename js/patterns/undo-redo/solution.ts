class History<T> {
  private past: T[] = []
  private future: T[] = []
  private present: T
  private limit: number

  constructor(initial: T, options: { limit?: number } = {}) {
    this.present = initial
    this.limit = options.limit ?? Infinity
  }

  get value(): T {
    return this.present
  }

  push(next: T): void {
    if (Object.is(next, this.present)) return
    this.past.push(this.present)
    if (this.past.length > this.limit) this.past.splice(0, this.past.length - this.limit)
    this.present = next
    this.future = []
  }

  undo(): T {
    if (this.past.length > 0) {
      this.future.push(this.present)
      this.present = this.past.pop() as T
    }
    return this.present
  }

  redo(): T {
    if (this.future.length > 0) {
      this.past.push(this.present)
      this.present = this.future.pop() as T
    }
    return this.present
  }

  canUndo(): boolean {
    return this.past.length > 0
  }

  canRedo(): boolean {
    return this.future.length > 0
  }
}
