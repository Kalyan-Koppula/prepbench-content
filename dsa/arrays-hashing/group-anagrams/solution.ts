function groupAnagrams(strs: string[]): string[][] {
  // Anagrams have identical letter counts, so the counts make a shared key.
  const groups = new Map<string, string[]>()
  for (let w = 0; w < strs.length; w++) {
    const word = strs[w]
    const count = new Array(26).fill(0)
    for (let i = 0; i < word.length; i++) {
      count[word.charCodeAt(i) - 97]++
    }
    // A separator keeps counts like [1, 11] and [11, 1] from colliding.
    const key = count.join(',')
    const group = groups.get(key)
    if (group === undefined) {
      groups.set(key, [word])
    } else {
      group.push(word)
    }
  }

  const result: string[][] = []
  for (const group of groups.values()) {
    result.push(group)
  }
  return result
}
