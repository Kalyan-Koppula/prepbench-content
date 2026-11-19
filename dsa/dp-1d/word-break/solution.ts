function wordBreak(s: string, wordDict: string[]): boolean {
  const words = new Set<string>()
  let longest = 0
  for (let i = 0; i < wordDict.length; i++) {
    words.add(wordDict[i])
    if (wordDict[i].length > longest) {
      longest = wordDict[i].length
    }
  }
  // ok[i] = the first i characters can be split into dictionary words.
  const ok = new Array(s.length + 1).fill(false)
  ok[0] = true // the empty prefix
  for (let i = 1; i <= s.length; i++) {
    // The last word is s[j..i); only lengths up to the longest word can work.
    for (let j = i - 1; j >= 0 && j >= i - longest; j--) {
      if (ok[j] && words.has(s.substring(j, i))) {
        ok[i] = true
        break
      }
    }
  }
  return ok[s.length]
}
