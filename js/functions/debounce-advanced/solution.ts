interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

function debounce<A extends unknown[], R>(fn: (...args: A) => R, wait: number, options: DebounceOptions = {}) {
  const { leading = false, trailing = true, maxWait } = options
  let timer: ReturnType<typeof setTimeout> | undefined
  let maxTimer: ReturnType<typeof setTimeout> | undefined
  let pending: { ctx: unknown; args: A } | undefined
  let result: R | undefined

  function run(call: { ctx: unknown; args: A }) {
    result = fn.apply(call.ctx, call.args)
  }

  function takePending() {
    const call = pending
    pending = undefined
    return call
  }

  function startMaxTimer() {
    if (maxWait === undefined) return
    maxTimer = setTimeout(() => {
      startMaxTimer()
      const call = takePending()
      if (call) run(call)
    }, maxWait)
  }

  function endBurst() {
    clearTimeout(timer)
    clearTimeout(maxTimer)
    timer = maxTimer = undefined
    const call = takePending()
    if (call && trailing) run(call)
  }

  function debounced(this: unknown, ...args: A): R | undefined {
    const burstStart = timer === undefined
    pending = { ctx: this, args }
    clearTimeout(timer)
    timer = setTimeout(endBurst, wait)
    if (burstStart) {
      startMaxTimer()
      if (leading) run(takePending()!)
    }
    return result
  }

  debounced.cancel = (): void => {
    clearTimeout(timer)
    clearTimeout(maxTimer)
    timer = maxTimer = undefined
    pending = undefined
  }

  debounced.flush = (): R | undefined => {
    if (timer !== undefined) endBurst()
    return result
  }

  return debounced
}
