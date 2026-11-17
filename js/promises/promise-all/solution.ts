function promiseAll<T>(iterable: Iterable<T | PromiseLike<T>>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable)
    const results: T[] = new Array(items.length)
    let remaining = items.length
    if (remaining === 0) {
      resolve(results)
      return
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value
        remaining -= 1
        if (remaining === 0) resolve(results)
      }, reject)
    })
  })
}
