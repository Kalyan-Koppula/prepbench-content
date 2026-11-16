class PrefixNode {
  children = new Map<string, PrefixNode>()
  isEnd = false
}

function longestCompleteWord(words: string[]): string {
  const root = new PrefixNode()
  for (const word of words) {
    let node = root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new PrefixNode())
      node = node.children.get(ch)!
    }
    node.isEnd = true
  }

  // Every node on the word's path must itself end a word.
  const isComplete = (word: string) => {
    let node = root
    for (const ch of word) {
      node = node.children.get(ch)!
      if (!node.isEnd) return false
    }
    return true
  }

  let best = ''
  for (const word of words) {
    const better = word.length > best.length || (word.length === best.length && word < best)
    if (better && isComplete(word)) best = word
  }
  return best
}
