function maxArea(height: number[]): number {
  let left = 0
  let right = height.length - 1
  let best = 0
  while (left < right) {
    const width = right - left
    const level = Math.min(height[left], height[right])
    const area = width * level
    if (area > best) {
      best = area
    }
    // The shorter line has just met its widest remaining partner. Any other
    // partner is narrower and still capped by this line, so drop it.
    if (height[left] < height[right]) {
      left++
    } else {
      right--
    }
  }
  return best
}
