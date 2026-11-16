function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>()
  for (const word of strs) {
    const count = new Array(26).fill(0)
    for (let i = 0; i < word.length; i++) count[word.charCodeAt(i) - 97]++
    const key = count.join('#')
    const bucket = groups.get(key)
    if (bucket) bucket.push(word)
    else groups.set(key, [word])
  }
  return [...groups.values()]
}
