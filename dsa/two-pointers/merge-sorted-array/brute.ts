function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  // Insert each value of nums2 into the sorted prefix of nums1, one at a time,
  // shifting larger values one slot to the right (insertion sort style).
  let size = m
  for (let j = 0; j < n; j++) {
    const value = nums2[j]
    let pos = size - 1
    while (pos >= 0 && nums1[pos] > value) {
      nums1[pos + 1] = nums1[pos]
      pos--
    }
    nums1[pos + 1] = value
    size++
  }
}
