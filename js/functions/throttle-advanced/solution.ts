interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

function throttle<A extends unknown[], R>(fn: (...args: A) => R, wait: number, options: ThrottleOptions = {}) {
  const { leading = true, trailing = true } = options
  let timer: ReturnType<typeof setTimeout> | undefined
  let saved: { ctx: unknown; args: A } | undefined
  let result: R | undefined

  function run(ctx: unknown, args: A) {
    result = fn.apply(ctx, args)
  }

  function openWindow() {
    timer = setTimeout(() => {
      timer = undefined
      const call = saved
      saved = undefined
      if (trailing && call) {
        openWindow()
        run(call.ctx, call.args)
      }
    }, wait)
  }

  function throttled(this: unknown, ...args: A): R | undefined {
    if (timer === undefined) {
      openWindow()
      if (leading) run(this, args)
      else saved = { ctx: this, args }
    } else {
      saved = { ctx: this, args }
    }
    return result
  }

  throttled.cancel = (): void => {
    clearTimeout(timer)
    timer = undefined
    saved = undefined
  }

  return throttled
}
