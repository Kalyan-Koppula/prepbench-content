function trap(height: number[]): number {
  let water = 0
  for (let i = 0; i < height.length; i++) {
    let left = 0
    let right = 0
    for (let j = 0; j <= i; j++) left = Math.max(left, height[j])
    for (let j = i; j < height.length; j++) right = Math.max(right, height[j])
    water += Math.min(left, right) - height[i]
  }
  return water
}
