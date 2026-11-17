function throttle<A extends unknown[]>(fn: (...args: A) => unknown, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let saved: { ctx: unknown; args: A } | undefined

  function openWindow() {
    timer = setTimeout(() => {
      timer = undefined
      if (!saved) return
      const { ctx, args } = saved
      saved = undefined
      openWindow()
      fn.apply(ctx, args)
    }, wait)
  }

  function throttled(this: unknown, ...args: A): void {
    if (timer !== undefined) {
      saved = { ctx: this, args }
      return
    }
    openWindow()
    fn.apply(this, args)
  }

  return throttled
}
