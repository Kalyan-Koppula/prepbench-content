class LRUCache<K, V> {
  private entries = new Map<K, V>() // iteration order = least to most recently used

  constructor(private capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError(`capacity must be a positive integer, got ${capacity}`)
  }

  get size(): number {
    return this.entries.size
  }

  get(key: K): V | undefined {
    if (!this.entries.has(key)) return undefined
    const value = this.entries.get(key) as V
    this.entries.delete(key)
    this.entries.set(key, value)
    return value
  }

  put(key: K, value: V): void {
    if (this.entries.has(key)) this.entries.delete(key)
    else if (this.entries.size >= this.capacity) this.entries.delete(this.entries.keys().next().value as K)
    this.entries.set(key, value)
  }
}
