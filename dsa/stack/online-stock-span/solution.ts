class StockSpanner {
  // [price, span] pairs; prices strictly decrease from bottom to top.
  stack: number[][] = []

  next(price: number): number {
    let span = 1
    while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
      span += this.stack.pop()![1]
    }
    this.stack.push([price, span])
    return span
  }
}
