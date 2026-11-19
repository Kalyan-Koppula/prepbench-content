class StockSpanner {
  prices: number[]

  constructor() {
    this.prices = []
  }

  // O(n) per call: walk back over every earlier price.
  next(price: number): number {
    this.prices.push(price)
    let span = 0
    let i = this.prices.length - 1
    while (i >= 0 && this.prices[i] <= price) {
      span++
      i--
    }
    return span
  }
}
