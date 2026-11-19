function trap(height: number[]): number {
  const n = height.length
  let water = 0
  for (let i = 0; i < n; i++) {
    // Scan both directions for the tallest bar on each side (including i itself,
    // so the level is never below the bar and the water never goes negative).
    let tallestLeft = 0
    for (let j = 0; j <= i; j++) {
      if (height[j] > tallestLeft) {
        tallestLeft = height[j]
      }
    }
    let tallestRight = 0
    for (let j = i; j < n; j++) {
      if (height[j] > tallestRight) {
        tallestRight = height[j]
      }
    }
    water += Math.min(tallestLeft, tallestRight) - height[i]
  }
  return water
}
