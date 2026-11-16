class LRUCache {
  capacity: number
  map = new Map<number, number>()

  constructor(capacity: number) {
    this.capacity = capacity
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1
    const value = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  put(key: number, value: number): void {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value!)
    }
  }
}
