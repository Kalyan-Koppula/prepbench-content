class TimeMap {
  history = new Map<string, [number, string][]>()

  set(key: string, value: string, timestamp: number): void {
    if (!this.history.has(key)) this.history.set(key, [])
    this.history.get(key)!.push([timestamp, value])
  }

  get(key: string, timestamp: number): string {
    const entries = this.history.get(key)
    if (!entries) return ''
    // First index whose time is > timestamp
    let lo = 0
    let hi = entries.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (entries[mid][0] <= timestamp) lo = mid + 1
      else hi = mid
    }
    return lo === 0 ? '' : entries[lo - 1][1]
  }
}
