class LRUCache {
  capacity: number
  keys: number[] // least recently used first
  values: number[]

  constructor(capacity: number) {
    this.capacity = capacity
    this.keys = []
    this.values = []
  }

indexOf(key: number): number {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] === key) {
        return i
      }
    }
    return -1
  }

  // O(capacity): remove position i and re-append it at the end.
moveToEnd(i: number): void {
    const key = this.keys[i]
    const value = this.values[i]
    for (let j = i; j < this.keys.length - 1; j++) {
      this.keys[j] = this.keys[j + 1]
      this.values[j] = this.values[j + 1]
    }
    this.keys[this.keys.length - 1] = key
    this.values[this.values.length - 1] = value
  }

  get(key: number): number {
    const i = this.indexOf(key)
    if (i === -1) {
      return -1
    }
    this.moveToEnd(i)
    return this.values[this.values.length - 1]
  }

  put(key: number, value: number): void {
    const i = this.indexOf(key)
    if (i !== -1) {
      this.values[i] = value
      this.moveToEnd(i)
      return
    }
    this.keys.push(key)
    this.values.push(value)
    if (this.keys.length > this.capacity) {
      this.moveToEnd(0)
      this.keys.pop()
      this.values.pop()
    }
  }
}
