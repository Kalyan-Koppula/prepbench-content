class MedianFinder {
  // Keep the values sorted with insertion: addNum O(n), findMedian O(1).
  values: number[]

  constructor() {
    this.values = []
  }

  addNum(num: number): void {
    let i = this.values.length
    this.values.push(num)
    while (i > 0 && this.values[i - 1] > num) {
      this.values[i] = this.values[i - 1]
      i--
    }
    this.values[i] = num
  }

  findMedian(): number {
    const n = this.values.length
    const mid = Math.floor(n / 2)
    if (n % 2 === 1) {
      return this.values[mid]
    }
    return (this.values[mid - 1] + this.values[mid]) / 2
  }
}
