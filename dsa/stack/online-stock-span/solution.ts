class StockSpanner {
  // Parallel stacks: prices[i] with the span it absorbed.
  // Prices strictly decrease from bottom to top.
  prices: number[]
  spans: number[]

  constructor() {
    this.prices = []
    this.spans = []
  }

  next(price: number): number {
    let span = 1 // today
    // Any day priced <= today is covered by today, along with the days it covered.
    while (this.prices.length > 0 && this.prices[this.prices.length - 1] <= price) {
      span += this.spans[this.spans.length - 1]
      this.prices.pop()
      this.spans.pop()
    }
    this.prices.push(price)
    this.spans.push(span)
    return span
  }
}
