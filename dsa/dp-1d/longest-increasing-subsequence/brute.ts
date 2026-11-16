// O(n^2): len[i] = longest increasing subsequence ending at i.
function lengthOfLIS(nums: number[]): number {
  const len = nums.map(() => 1)
  for (let i = 0; i < nums.length; i++)
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) len[i] = Math.max(len[i], len[j] + 1)
  return Math.max(...len)
}
