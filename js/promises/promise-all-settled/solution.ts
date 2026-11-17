type Outcome<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }

function promiseAllSettled<T>(iterable: Iterable<T | PromiseLike<T>>): Promise<Outcome<T>[]> {
  return new Promise((resolve) => {
    const items = Array.from(iterable)
    const results: Outcome<T>[] = new Array(items.length)
    let remaining = items.length
    if (remaining === 0) {
      resolve(results)
      return
    }
    const record = (index: number, outcome: Outcome<T>) => {
      results[index] = outcome
      remaining -= 1
      if (remaining === 0) resolve(results)
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => record(index, { status: 'fulfilled', value }),
        (reason) => record(index, { status: 'rejected', reason }),
      )
    })
  })
}
