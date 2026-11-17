function debounce<A extends unknown[]>(fn: (...args: A) => unknown, wait: number) {
  function debounced(this: unknown, ...args: A): void {
    // TODO
  }
  debounced.cancel = () => {
    // TODO
  }
  return debounced
}
