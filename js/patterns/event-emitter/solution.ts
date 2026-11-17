type Listener = (...args: any[]) => void

interface ListenerRecord {
  fn: Listener
  once: boolean
  fired: boolean
}

class EventEmitter {
  private listeners = new Map<string, ListenerRecord[]>()

  on(event: string, listener: Listener): () => void {
    return this.add(event, listener, false)
  }

  once(event: string, listener: Listener): () => void {
    return this.add(event, listener, true)
  }

  off(event: string, listener: Listener): void {
    const list = this.listeners.get(event)
    if (!list) return
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].fn === listener) {
        list.splice(i, 1)
        return
      }
    }
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this.listeners.get(event)
    if (!list || list.length === 0) return false
    for (const record of [...list]) {
      if (record.once) {
        if (record.fired) continue
        record.fired = true
        this.remove(event, record)
      }
      record.fn.apply(this, args)
    }
    return true
  }

  private add(event: string, fn: Listener, once: boolean): () => void {
    const record: ListenerRecord = { fn, once, fired: false }
    const list = this.listeners.get(event)
    if (list) list.push(record)
    else this.listeners.set(event, [record])
    return () => this.remove(event, record)
  }

  private remove(event: string, record: ListenerRecord) {
    const list = this.listeners.get(event)
    const i = list ? list.indexOf(record) : -1
    if (i !== -1) list!.splice(i, 1)
  }
}
