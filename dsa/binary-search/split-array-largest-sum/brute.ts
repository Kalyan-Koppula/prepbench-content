function splitArray(nums: number[], k: number): number {
  // DP: best[p][i] = smallest possible largest sum when the first i values
  // are cut into p pieces. O(k * n^2): the "better" approach.
  const n = nums.length
  const prefix = new Array(n + 1).fill(0)
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + nums[i]
  }

  let previous = new Array(n + 1).fill(Infinity)
  for (let i = 1; i <= n; i++) {
    previous[i] = prefix[i] // one piece: the whole prefix
  }
  for (let pieces = 2; pieces <= k; pieces++) {
    const current = new Array(n + 1).fill(Infinity)
    for (let i = pieces; i <= n; i++) {
      // The last piece is nums[cut .. i - 1].
      for (let cut = pieces - 1; cut < i; cut++) {
        const last = prefix[i] - prefix[cut]
        const largest = previous[cut] > last ? previous[cut] : last
        if (largest < current[i]) {
          current[i] = largest
        }
      }
    }
    previous = current
  }
  return previous[n]
}
