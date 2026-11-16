class WordNode {
  children = new Map<string, WordNode>()
  isEnd = false
}

class WordDictionary {
  root = new WordNode()

  addWord(word: string): void {
    let node = this.root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new WordNode())
      node = node.children.get(ch)!
    }
    node.isEnd = true
  }

  search(pattern: string): boolean {
    const dfs = (node: WordNode, i: number): boolean => {
      if (i === pattern.length) return node.isEnd
      const ch = pattern[i]
      if (ch !== '.') {
        const next = node.children.get(ch)
        return next !== undefined && dfs(next, i + 1)
      }
      // Wildcard: any child may continue the match.
      for (const child of node.children.values()) {
        if (dfs(child, i + 1)) return true
      }
      return false
    }
    return dfs(this.root, 0)
  }
}
