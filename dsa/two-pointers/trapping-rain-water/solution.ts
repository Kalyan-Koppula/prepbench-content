function trap(height: number[]): number {
  let l = 0
  let r = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0
  while (l < r) {
    // the lower side's water level is fixed by its own running max
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l])
      water += leftMax - height[l]
      l++
    } else {
      rightMax = Math.max(rightMax, height[r])
      water += rightMax - height[r]
      r--
    }
  }
  return water
}
