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
  // TODO
  return {
    state: '',
    context: {} as Record<string, any>,
    send(event: string, payload?: unknown): string {
      return ''
    },
    can(event: string, payload?: unknown): boolean {
      return false
    },
  }
}
