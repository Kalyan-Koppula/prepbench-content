class PrefixNode {
  children: Array<PrefixNode | null>
  isEnd: boolean

  constructor() {
    this.children = new Array(26).fill(null)
    this.isEnd = false
  }
}

// A word is complete when every node on its path ends some word.
function isComplete(root: PrefixNode, word: string): boolean {
  let node = root
  for (let i = 0; i < word.length; i++) {
    node = node.children[word.charCodeAt(i) - 97] as PrefixNode // the word was inserted
    if (!node.isEnd) {
      return false
    }
  }
  return true
}

function longestCompleteWord(words: string[]): string {
  const root = new PrefixNode()
  for (let w = 0; w < words.length; w++) {
    const word = words[w]
    let node = root
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i) - 97
      let child = node.children[c]
      if (child === null) {
        child = new PrefixNode()
        node.children[c] = child
      }
      node = child
    }
    node.isEnd = true
  }

  let best = ''
  for (let w = 0; w < words.length; w++) {
    const word = words[w]
    // Only check words that would beat the current best.
    const better = word.length > best.length || (word.length === best.length && word < best)
    if (better && isComplete(root, word)) {
      best = word
    }
  }
  return best
}
