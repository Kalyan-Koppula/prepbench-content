class MedianFinder {
  values: number[] = []

  addNum(num: number): void {
    this.values.push(num)
  }

  findMedian(): number {
    const s = [...this.values].sort((a, b) => a - b)
    const mid = s.length >> 1
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
  }
}
