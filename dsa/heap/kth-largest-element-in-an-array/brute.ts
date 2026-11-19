function findKthLargest(nums: number[], k: number): number {
  // Sort a copy in descending order: O(n log n).
  const sorted = nums.slice()
  sorted.sort((a, b) => b - a)
  return sorted[k - 1]
}
