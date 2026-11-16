function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  for (let j = 0; j < n; j++) nums1[m + j] = nums2[j]
  nums1.sort((a, b) => a - b)
}
