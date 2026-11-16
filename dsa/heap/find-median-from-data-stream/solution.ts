class MedianFinder {
  low = new PriorityQueue<number>((a, b) => b - a) // max-heap: smaller half
  high = new PriorityQueue<number>() // min-heap: larger half

  addNum(num: number): void {
    // Route through `low` so every value in low <= every value in high.
    this.low.push(num)
    this.high.push(this.low.pop()!)
    // Keep low the same size as high, or one larger.
    if (this.high.size() > this.low.size()) this.low.push(this.high.pop()!)
  }

  findMedian(): number {
    if (this.low.size() > this.high.size()) return this.low.peek()!
    return (this.low.peek()! + this.high.peek()!) / 2
  }
}
