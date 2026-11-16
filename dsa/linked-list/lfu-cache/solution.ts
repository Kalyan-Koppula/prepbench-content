class LFUCache {
  capacity: number
  values = new Map<number, number>()
  freq = new Map<number, number>()
  // count -> keys with that count, oldest first (Set keeps insertion order)
  buckets = new Map<number, Set<number>>()
  minFreq = 0

  constructor(capacity: number) {
    this.capacity = capacity
  }

  get(key: number): number {
    if (!this.values.has(key)) return -1
    this.touch(key)
    return this.values.get(key)!
  }

  put(key: number, value: number): void {
    if (this.values.has(key)) {
      this.values.set(key, value)
      this.touch(key)
      return
    }
    if (this.values.size >= this.capacity) {
      const bucket = this.buckets.get(this.minFreq)!
      const victim = bucket.values().next().value!
      bucket.delete(victim)
      if (bucket.size === 0) this.buckets.delete(this.minFreq)
      this.values.delete(victim)
      this.freq.delete(victim)
    }
    this.values.set(key, value)
    this.freq.set(key, 1)
    this.addToBucket(1, key)
    this.minFreq = 1
  }

  touch(key: number): void {
    const f = this.freq.get(key)!
    const bucket = this.buckets.get(f)!
    bucket.delete(key)
    if (bucket.size === 0) {
      this.buckets.delete(f)
      if (this.minFreq === f) this.minFreq = f + 1
    }
    this.freq.set(key, f + 1)
    this.addToBucket(f + 1, key)
  }

  addToBucket(f: number, key: number): void {
    if (!this.buckets.has(f)) this.buckets.set(f, new Set())
    this.buckets.get(f)!.add(key)
  }
}
