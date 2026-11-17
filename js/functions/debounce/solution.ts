function debounce<A extends unknown[]>(fn: (...args: A) => unknown, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined

  function debounced(this: unknown, ...args: A): void {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      fn.apply(this, args)
    }, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }

  return debounced
}
