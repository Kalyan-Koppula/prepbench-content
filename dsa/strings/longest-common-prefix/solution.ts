function longestCommonPrefix(strs: string[]): string {
  const first = strs[0]
  // Vertical scan: compare column i across all strings.
  for (let i = 0; i < first.length; i++) {
    for (let k = 1; k < strs.length; k++) {
      if (i >= strs[k].length || strs[k][i] !== first[i]) {
        return first.substring(0, i)
      }
    }
  }
  return first
}
