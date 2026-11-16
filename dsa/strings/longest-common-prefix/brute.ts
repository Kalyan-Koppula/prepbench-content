function longestCommonPrefix(strs: string[]): string {
  let prefix = strs[0]
  for (const s of strs) while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return prefix
}
