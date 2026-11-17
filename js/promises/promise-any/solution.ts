function promiseAny<T>(iterable: Iterable<T | PromiseLike<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable)
    const errors: unknown[] = new Array(items.length)
    let remaining = items.length
    const fail = () => reject(new AggregateError(errors, 'All promises were rejected'))
    if (remaining === 0) {
      fail()
      return
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then(resolve, (reason) => {
        errors[index] = reason
        remaining -= 1
        if (remaining === 0) fail()
      })
    })
  })
}
