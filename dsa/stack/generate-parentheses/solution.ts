function generateParenthesis(n: number): string[] {
  const result: string[] = []

  // open / close = how many of each have been placed so far.
  function build(current: string, open: number, close: number): void {
    if (current.length === 2 * n) {
      result.push(current)
      return
    }
    if (open < n) {
      build(current + '(', open + 1, close) // an opener is available
    }
    if (close < open) {
      build(current + ')', open, close + 1) // only close what is open
    }
  }

  build('', 0, 0)
  return result
}
