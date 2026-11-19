function largestRectangleArea(heights: number[]): number {
  let best = 0
  for (let start = 0; start < heights.length; start++) {
    // Widen to the right, keeping the lowest bar seen (it caps the height).
    let min = heights[start]
    for (let end = start; end < heights.length; end++) {
      if (heights[end] < min) {
        min = heights[end]
      }
      const area = min * (end - start + 1)
      if (area > best) {
        best = area
      }
    }
  }
  return best
}
