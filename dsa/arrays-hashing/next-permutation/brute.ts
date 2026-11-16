function nextPermutation(nums: number[]): void {
  // Enumerate every distinct ordering, sort them, and pick the successor.
  const perms = new Set<string>()
  const used = new Array(nums.length).fill(false)
  const cur: number[] = []
  const go = () => {
    if (cur.length === nums.length) return void perms.add(cur.join(','))
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      used[i] = true
      cur.push(nums[i])
      go()
      cur.pop()
      used[i] = false
    }
  }
  go()
  const cmp = (a: number[], b: number[]) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
    return 0
  }
  const all = [...perms].map((p) => p.split(',').map(Number)).sort(cmp)
  const idx = all.findIndex((p) => cmp(p, nums) === 0)
  const next = all[(idx + 1) % all.length]
  for (let i = 0; i < nums.length; i++) nums[i] = next[i]
}
