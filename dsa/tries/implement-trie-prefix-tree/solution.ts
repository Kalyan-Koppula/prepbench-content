class TrieNode {
  children = new Map<string, TrieNode>()
  isEnd = false
}

class Trie {
  root = new TrieNode()

  insert(word: string): void {
    let node = this.root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode())
      node = node.children.get(ch)!
    }
    node.isEnd = true
  }

  search(word: string): boolean {
    const node = this.walk(word)
    return node !== null && node.isEnd
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null
  }

  // Follows `s` from the root; null if the path breaks off.
  walk(s: string): TrieNode | null {
    let node: TrieNode | undefined = this.root
    for (const ch of s) {
      node = node.children.get(ch)
      if (!node) return null
    }
    return node
  }
}
