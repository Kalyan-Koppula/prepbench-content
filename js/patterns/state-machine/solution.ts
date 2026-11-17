type Fn = (context: any, payload?: any) => any
type Transition = string | { target?: string; guard?: Fn; action?: Fn }
interface StateConfig {
  entry?: Fn
  exit?: Fn
  on?: Record<string, Transition | Transition[]>
}
interface MachineConfig {
  initial: string
  context?: Record<string, any>
  states: Record<string, StateConfig>
}

function createMachine(config: MachineConfig) {
  const { states } = config
  const has = (name: unknown) => typeof name === 'string' && Object.prototype.hasOwnProperty.call(states, name)
  const candidates = (t: Transition | Transition[]) => (Array.isArray(t) ? t : [t]).map((c) => (typeof c === 'string' ? { target: c } : c))

  if (!has(config.initial)) throw new Error(`Unknown initial state "${config.initial}"`)
  for (const [name, state] of Object.entries(states)) {
    for (const [event, transition] of Object.entries(state.on ?? {})) {
      for (const c of candidates(transition)) {
        if (c.target !== undefined && !has(c.target)) throw new Error(`State "${name}" sends ${event} to unknown state "${c.target}"`)
      }
    }
  }

  const context = config.context ?? {}
  let current = config.initial

  const pick = (event: string, payload: unknown) => {
    const transition = states[current].on?.[event]
    if (transition === undefined) return undefined
    return candidates(transition).find((c) => !c.guard || c.guard(context, payload))
  }

  states[current].entry?.(context, undefined)

  return {
    get state() {
      return current
    },
    get context() {
      return context
    },
    send(event: string, payload?: unknown): string {
      const chosen = pick(event, payload)
      if (!chosen) return current
      if (chosen.target === undefined) {
        chosen.action?.(context, payload)
        return current
      }
      states[current].exit?.(context, payload)
      chosen.action?.(context, payload)
      current = chosen.target
      states[current].entry?.(context, payload)
      return current
    },
    can(event: string, payload?: unknown): boolean {
      return pick(event, payload) !== undefined
    },
  }
}
