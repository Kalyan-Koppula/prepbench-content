class TimeMap {
  // key -> timestamps and values in parallel, in the (increasing) order they were set.
  times: Map<string, number[]>
  values: Map<string, string[]>

  constructor() {
    this.times = new Map()
    this.values = new Map()
  }

  set(key: string, value: string, timestamp: number): void {
    let keyTimes = this.times.get(key)
    let keyValues = this.values.get(key)
    if (keyTimes === undefined || keyValues === undefined) {
      keyTimes = []
      keyValues = []
      this.times.set(key, keyTimes)
      this.values.set(key, keyValues)
    }
    keyTimes.push(timestamp)
    keyValues.push(value)
  }

  get(key: string, timestamp: number): string {
    const keyTimes = this.times.get(key)
    const keyValues = this.values.get(key)
    if (keyTimes === undefined || keyValues === undefined) {
      return ''
    }
    // Find the first index whose time is greater than timestamp.
    let lo = 0
    let hi = keyTimes.length
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      if (keyTimes[mid] <= timestamp) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    // The entry just before it is the latest one at or before timestamp.
    if (lo === 0) {
      return ''
    }
    return keyValues[lo - 1]
  }
}
