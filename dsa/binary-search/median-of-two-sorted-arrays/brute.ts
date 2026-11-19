function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Merge the two sorted arrays, then read the middle. O(m + n).
  const merged: number[] = []
  let i = 0
  let j = 0
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) {
      merged.push(nums1[i])
      i++
    } else {
      merged.push(nums2[j])
      j++
    }
  }
  while (i < nums1.length) {
    merged.push(nums1[i])
    i++
  }
  while (j < nums2.length) {
    merged.push(nums2[j])
    j++
  }
  const total = merged.length
  const mid = Math.floor(total / 2)
  if (total % 2 === 1) {
    return merged[mid]
  }
  return (merged[mid - 1] + merged[mid]) / 2
}
