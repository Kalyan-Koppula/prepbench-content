class TimeMap {
  keys: string[]
  values: string[]
  stamps: number[]

  constructor() {
    this.keys = []
    this.values = []
    this.stamps = []
  }

  set(key: string, value: string, timestamp: number): void {
    this.keys.push(key)
    this.values.push(value)
    this.stamps.push(timestamp)
  }

  // O(total sets): scan everything for the latest matching entry.
  get(key: string, timestamp: number): string {
    let best = ''
    let bestTime = -1
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] === key && this.stamps[i] <= timestamp && this.stamps[i] > bestTime) {
        best = this.values[i]
        bestTime = this.stamps[i]
      }
    }
    return best
  }
}
