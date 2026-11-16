class LFUCache {
  capacity: number
  clock = 0
  entries = new Map<number, { value: number; count: number; lastUsed: number }>()

  constructor(capacity: number) {
    this.capacity = capacity
  }

  get(key: number): number {
    const e = this.entries.get(key)
    if (!e) return -1
    e.count++
    e.lastUsed = ++this.clock
    return e.value
  }

  put(key: number, value: number): void {
    const e = this.entries.get(key)
    if (e) {
      e.value = value
      e.count++
      e.lastUsed = ++this.clock
      return
    }
    if (this.entries.size >= this.capacity) {
      let victim = -1
      let best: { count: number; lastUsed: number } | null = null
      for (const [k, x] of this.entries) {
        if (!best || x.count < best.count || (x.count === best.count && x.lastUsed < best.lastUsed)) {
          best = x
          victim = k
        }
      }
      this.entries.delete(victim)
    }
    this.entries.set(key, { value, count: 1, lastUsed: ++this.clock })
  }
}
