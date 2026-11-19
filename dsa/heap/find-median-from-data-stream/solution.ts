class MedianFinder {
  low: PriorityQueue<number> // max-heap: the smaller half
  high: PriorityQueue<number> // min-heap: the larger half

  constructor() {
    this.low = new PriorityQueue<number>((a, b) => b - a)
    this.high = new PriorityQueue<number>((a, b) => a - b)
  }

  addNum(num: number): void {
    // Pass through `low` so every value in low stays <= every value in high.
    this.low.push(num)
    this.high.push(this.low.pop() as number)
    // Keep low the same size as high, or one larger.
    if (this.high.size() > this.low.size()) {
      this.low.push(this.high.pop() as number)
    }
  }

  findMedian(): number {
    const lowTop = this.low.peek() as number
    if (this.low.size() > this.high.size()) {
      return lowTop // odd count: the middle value
    }
    const highTop = this.high.peek() as number
    return (lowTop + highTop) / 2
  }
}
