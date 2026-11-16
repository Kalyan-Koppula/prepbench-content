function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let i = m - 1
  let j = n - 1
  // fill from the back, where the free slots are
  for (let k = m + n - 1; j >= 0; k--) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k] = nums1[i--]
    else nums1[k] = nums2[j--]
  }
}
