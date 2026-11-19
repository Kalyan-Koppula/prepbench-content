function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let i = m - 1 // last real value in nums1
  let j = n - 1 // last value in nums2
  let write = m + n - 1 // next slot to fill, starting at the very end

  // Fill from the back: the free slots are there, so nothing unread is overwritten.
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[write] = nums1[i]
      i--
    } else {
      nums1[write] = nums2[j]
      j--
    }
    write--
  }
  // If nums2 ran out first, the rest of nums1 is already in place.
}
