function maxArea(height: number[]): number {
  let l = 0
  let r = height.length - 1
  let best = 0
  while (l < r) {
    best = Math.max(best, (r - l) * Math.min(height[l], height[r]))
    // the shorter line can't do better with any narrower partner
    if (height[l] <= height[r]) l++
    else r--
  }
  return best
}
