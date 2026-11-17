interface ReadonlySignal<T> {
  readonly value: T
}
interface Signal<T> {
  value: T
}

const CLEAN = 0
const CHECK = 1 // a source further upstream changed; maybe we did too
const DIRTY = 2 // a direct source changed; must rerun

class ReactiveNode {
  value: unknown
  state = CLEAN
  sources: ReactiveNode[] = []
  observers = new Set<ReactiveNode>()
  disposed = false

  constructor(
    public fn: (() => unknown) | null,
    public isEffect = false,
  ) {
    if (fn) this.state = DIRTY
  }

  read(): unknown {
    if (current && !current.sources.includes(this)) {
      current.sources.push(this)
      this.observers.add(current)
    }
    this.updateIfNecessary()
    return this.value
  }

  write(value: unknown) {
    if (Object.is(value, this.value)) return
    this.value = value
    for (const observer of this.observers) observer.mark(DIRTY)
    flushEffects()
  }

  mark(state: number) {
    if (this.state >= state) return
    if (this.state === CLEAN && this.isEffect) queue.push(this)
    this.state = state
    for (const observer of this.observers) observer.mark(CHECK)
  }

  updateIfNecessary() {
    if (this.state === CHECK) {
      for (const source of this.sources) {
        source.updateIfNecessary()
        if ((this.state as number) === DIRTY) break
      }
    }
    if (this.state === DIRTY) this.update()
    this.state = CLEAN
  }

  update() {
    const previous = this.value
    for (const source of this.sources) source.observers.delete(this)
    this.sources = []
    const outer = current
    current = this
    try {
      this.value = this.fn!()
    } finally {
      current = outer
    }
    if (!this.isEffect && !Object.is(previous, this.value)) {
      for (const observer of this.observers) observer.state = DIRTY
    }
  }

  dispose() {
    this.disposed = true
    for (const source of this.sources) source.observers.delete(this)
    this.sources = []
  }
}

let current: ReactiveNode | null = null
const queue: ReactiveNode[] = []
let flushing = false

function flushEffects() {
  if (flushing) return
  flushing = true
  try {
    while (queue.length) {
      const node = queue.shift()!
      if (!node.disposed) node.updateIfNecessary()
    }
  } finally {
    flushing = false
  }
}

function signal<T>(initial: T): Signal<T> {
  const node = new ReactiveNode(null)
  node.value = initial
  return {
    get value() {
      return node.read() as T
    },
    set value(next: T) {
      node.write(next)
    },
  }
}

function computed<T>(fn: () => T): ReadonlySignal<T> {
  const node = new ReactiveNode(fn)
  return {
    get value() {
      return node.read() as T
    },
  }
}

function effect(fn: () => void): () => void {
  const node = new ReactiveNode(fn, true)
  node.updateIfNecessary()
  return () => node.dispose()
}
