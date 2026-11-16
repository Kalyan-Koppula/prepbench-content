function largestRectangleArea(heights: number[]): number {
  const stack: number[] = [] // indices with increasing heights
  let best = 0
  for (let i = 0; i <= heights.length; i++) {
    // A height-0 sentinel at the end flushes everything left on the stack.
    const h = i === heights.length ? 0 : heights[i]
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()!]
      // Rectangle spans between the new stack top (exclusive) and i (exclusive).
      const leftBound = stack.length ? stack[stack.length - 1] : -1
      best = Math.max(best, height * (i - leftBound - 1))
    }
    stack.push(i)
  }
  return best
}
