function longestCompleteWord(words: string[]): string {
  // Check every prefix of every word against a set: O(sum of length^2).
  const stored = new Set<string>()
  for (let i = 0; i < words.length; i++) {
    stored.add(words[i])
  }
  let best = ''
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    let complete = true
    for (let length = 1; length <= word.length; length++) {
      if (!stored.has(word.substring(0, length))) {
        complete = false
        break
      }
    }
    if (!complete) {
      continue
    }
    if (word.length > best.length || (word.length === best.length && word < best)) {
      best = word
    }
  }
  return best
}
