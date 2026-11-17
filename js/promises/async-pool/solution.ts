function asyncPool<T>(tasks: (() => T | PromiseLike<T>)[], limit: number): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(tasks.length)
    let next = 0
    let finished = 0
    let failed = false
    if (tasks.length === 0) {
      resolve(results)
      return
    }

    const launch = () => {
      if (failed || next >= tasks.length) return
      const index = next++
      let pending: Promise<T>
      try {
        pending = Promise.resolve(tasks[index]())
      } catch (error) {
        pending = Promise.reject(error)
      }
      pending.then(
        (value) => {
          results[index] = value
          finished += 1
          if (finished === tasks.length) resolve(results)
          else launch()
        },
        (error) => {
          failed = true
          reject(error)
        },
      )
    }

    for (let i = 0; i < Math.min(limit, tasks.length); i++) launch()
  })
}
