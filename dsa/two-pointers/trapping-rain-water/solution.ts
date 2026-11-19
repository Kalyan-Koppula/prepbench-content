function trap(height: number[]): number {
  let left = 0
  let right = height.length - 1
  let leftMax = 0 // tallest bar in height[0 .. left]
  let rightMax = 0 // tallest bar in height[right .. n - 1]
  let water = 0

  while (left < right) {
    // Work on the lower side: the other side already has a bar at least as tall,
    // so this side's water level is decided by its own running max.
    if (height[left] < height[right]) {
      if (height[left] > leftMax) {
        leftMax = height[left]
      }
      water += leftMax - height[left]
      left++
    } else {
      if (height[right] > rightMax) {
        rightMax = height[right]
      }
      water += rightMax - height[right]
      right--
    }
  }
  return water
}
