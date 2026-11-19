function maxArea(height: number[]): number {
  const n = height.length
  let best = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const area = (j - i) * Math.min(height[i], height[j])
      if (area > best) {
        best = area
      }
    }
  }
  return best
}
