interface ReadonlySignal<T> {
  readonly value: T
}
interface Signal<T> {
  value: T
}

function signal<T>(initial: T): Signal<T> {
  // TODO
  return { value: initial }
}

function computed<T>(fn: () => T): ReadonlySignal<T> {
  // TODO
  return { value: undefined as T }
}

function effect(fn: () => void): () => void {
  // TODO
  return () => {}
}
