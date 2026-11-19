function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Binary search over the shorter array.
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1)
  }
  const m = nums1.length
  const n = nums2.length
  const half = Math.floor((m + n + 1) / 2) // size of the combined left half

  let lo = 0
  let hi = m
  while (lo <= hi) {
    const i = lo + Math.floor((hi - lo) / 2) // how many of nums1 go to the left half
    const j = half - i // the rest of the left half comes from nums2

    // Values just around each cut; missing neighbours act as -infinity / +infinity.
    const left1 = i > 0 ? nums1[i - 1] : -Infinity
    const right1 = i < m ? nums1[i] : Infinity
    const left2 = j > 0 ? nums2[j - 1] : -Infinity
    const right2 = j < n ? nums2[j] : Infinity

    if (left1 > right2) {
      hi = i - 1 // took too many from nums1
    } else if (left2 > right1) {
      lo = i + 1 // took too few from nums1
    } else {
      // Every left value <= every right value: the cut is correct.
      const leftMax = left1 > left2 ? left1 : left2
      if ((m + n) % 2 === 1) {
        return leftMax
      }
      const rightMin = right1 < right2 ? right1 : right2
      return (leftMax + rightMin) / 2
    }
  }
  return 0 // unreachable for valid input
}
