type Listener = (...args: any[]) => void

class EventEmitter {
  on(event: string, listener: Listener): () => void {
    // TODO
    return () => {}
  }

  once(event: string, listener: Listener): () => void {
    // TODO
    return () => {}
  }

  off(event: string, listener: Listener): void {
    // TODO
  }

  emit(event: string, ...args: unknown[]): boolean {
    // TODO
    return false
  }
}
