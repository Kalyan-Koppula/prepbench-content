class StockSpanner {
  prices: number[] = []

  next(price: number): number {
    this.prices.push(price)
    let span = 0
    for (let i = this.prices.length - 1; i >= 0 && this.prices[i] <= price; i--) span++
    return span
  }
}
