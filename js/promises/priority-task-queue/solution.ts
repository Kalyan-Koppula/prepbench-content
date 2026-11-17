interface Job {
  task: () => unknown
  priority: number
  resolve: (value: any) => void
  reject: (reason: unknown) => void
}

class TaskQueue {
  private waiting: Job[] = []
  private busy = false

  add<T>(task: () => T | PromiseLike<T>, priority = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.waiting.push({ task, priority, resolve, reject })
      this.runNext()
    })
  }

  get size(): number {
    return this.waiting.length
  }

  private runNext() {
    if (this.busy || this.waiting.length === 0) return
    // Strict > keeps the earliest-added job when priorities tie.
    let best = 0
    for (let i = 1; i < this.waiting.length; i++) {
      if (this.waiting[i].priority > this.waiting[best].priority) best = i
    }
    const [job] = this.waiting.splice(best, 1)
    this.busy = true

    let outcome: Promise<unknown>
    try {
      outcome = Promise.resolve(job.task())
    } catch (error) {
      outcome = Promise.reject(error)
    }
    outcome
      .then(job.resolve, job.reject)
      .then(() => {
        this.busy = false
        this.runNext()
      })
  }
}
