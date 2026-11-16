function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  const all = [...nums1, ...nums2].sort((a, b) => a - b)
  const mid = all.length >> 1
  return all.length % 2 === 1 ? all[mid] : (all[mid - 1] + all[mid]) / 2
}
