class TimeMap {
  log: [string, string, number][] = []

  set(key: string, value: string, timestamp: number): void {
    this.log.push([key, value, timestamp])
  }

  get(key: string, timestamp: number): string {
    let best = ''
    let bestTime = -1
    for (const [k, v, t] of this.log) {
      if (k === key && t <= timestamp && t > bestTime) {
        best = v
        bestTime = t
      }
    }
    return best
  }
}
