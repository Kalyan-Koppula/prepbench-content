function wordBreak(s: string, wordDict: string[]): boolean {
  const words = new Set(wordDict)
  let maxLen = 0
  for (const w of wordDict) maxLen = Math.max(maxLen, w.length)

  // ok[i] = the prefix s[0..i) can be split into dictionary words.
  const ok = new Array(s.length + 1).fill(false)
  ok[0] = true
  for (let i = 1; i <= s.length; i++) {
    for (let j = i - 1; j >= Math.max(0, i - maxLen); j--) {
      if (ok[j] && words.has(s.slice(j, i))) {
        ok[i] = true
        break
      }
    }
  }
  return ok[s.length]
}
