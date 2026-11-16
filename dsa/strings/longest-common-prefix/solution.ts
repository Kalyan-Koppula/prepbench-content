function longestCommonPrefix(strs: string[]): string {
  const first = strs[0]
  for (let i = 0; i < first.length; i++) {
    for (const s of strs) {
      if (i >= s.length || s[i] !== first[i]) return first.slice(0, i)
    }
  }
  return first
}
