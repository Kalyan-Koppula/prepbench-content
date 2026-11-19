class LFUCache {
  capacity: number
  clock: number
  values: Map<number, number>
  counts: Map<number, number>
  lastUsed: Map<number, number>

  constructor(capacity: number) {
    this.capacity = capacity
    this.clock = 0
    this.values = new Map()
    this.counts = new Map()
    this.lastUsed = new Map()
  }

  get(key: number): number {
    const value = this.values.get(key)
    if (value === undefined) {
      return -1
    }
    this.counts.set(key, (this.counts.get(key) as number) + 1)
    this.clock++
    this.lastUsed.set(key, this.clock)
    return value
  }

  put(key: number, value: number): void {
    this.clock++
    if (this.values.has(key)) {
      this.values.set(key, value)
      this.counts.set(key, (this.counts.get(key) as number) + 1)
      this.lastUsed.set(key, this.clock)
      return
    }
    if (this.values.size >= this.capacity) {
      // O(capacity): scan for the lowest count, oldest use on ties.
      let victim = -1
      let victimCount = Infinity
      let victimTime = Infinity
      for (const k of this.values.keys()) {
        const c = this.counts.get(k) as number
        const t = this.lastUsed.get(k) as number
        if (c < victimCount || (c === victimCount && t < victimTime)) {
          victim = k
          victimCount = c
          victimTime = t
        }
      }
      this.values.delete(victim)
      this.counts.delete(victim)
      this.lastUsed.delete(victim)
    }
    this.values.set(key, value)
    this.counts.set(key, 1)
    this.lastUsed.set(key, this.clock)
  }
}
