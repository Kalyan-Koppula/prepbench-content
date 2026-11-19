function largestRectangleArea(heights: number[]): number {
  const n = heights.length
  const stack: number[] = [] // bar indices with increasing heights
  let best = 0
  for (let i = 0; i <= n; i++) {
    // A height-0 bar after the end flushes everything left on the stack.
    const h = i === n ? 0 : heights[i]
    // Bar i is lower than the top, so the top's rectangle can't extend past i.
    while (stack.length > 0 && heights[stack[stack.length - 1]] >= h) {
      const top = stack.pop() as number
      const height = heights[top]
      // It extends left to just after the bar now below it on the stack.
      const leftBound = stack.length === 0 ? -1 : stack[stack.length - 1]
      const width = i - leftBound - 1
      if (height * width > best) {
        best = height * width
      }
    }
    stack.push(i)
  }
  return best
}
