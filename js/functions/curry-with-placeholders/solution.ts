function curry(fn: (...args: any[]) => unknown) {
  const _ = curry.placeholder
  const ready = (args: unknown[]) => args.length >= fn.length && args.slice(0, fn.length).every((a) => a !== _)

  function merge(have: unknown[], incoming: unknown[]) {
    const out = have.slice()
    let next = 0
    for (let i = 0; i < out.length && next < incoming.length; i++) {
      if (out[i] === _) out[i] = incoming[next++]
    }
    return out.concat(incoming.slice(next))
  }

  function step(have: unknown[]) {
    return (...incoming: unknown[]): unknown => {
      const args = merge(have, incoming)
      return ready(args) ? fn(...args) : step(args)
    }
  }

  return step([])
}

curry.placeholder = Symbol('curry.placeholder')
