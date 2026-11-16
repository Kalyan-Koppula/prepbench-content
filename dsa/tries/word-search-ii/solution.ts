class WordTrieNode {
  children = new Map<string, WordTrieNode>()
  word: string | null = null // set on the node where a word ends
}

function findWords(board: string[][], words: string[]): string[] {
  const root = new WordTrieNode()
  for (const w of words) {
    let node = root
    for (const ch of w) {
      if (!node.children.has(ch)) node.children.set(ch, new WordTrieNode())
      node = node.children.get(ch)!
    }
    node.word = w
  }

  const rows = board.length
  const cols = board[0].length
  const found: string[] = []

  const dfs = (r: number, c: number, parent: WordTrieNode) => {
    const ch = board[r][c]
    const node = parent.children.get(ch)
    if (!node) return
    if (node.word !== null) {
      found.push(node.word)
      node.word = null // report each word once
    }
    board[r][c] = '#' // mark visited
    if (r > 0) dfs(r - 1, c, node)
    if (r < rows - 1) dfs(r + 1, c, node)
    if (c > 0) dfs(r, c - 1, node)
    if (c < cols - 1) dfs(r, c + 1, node)
    board[r][c] = ch
    // Prune exhausted branches so later searches skip them.
    if (node.children.size === 0 && node.word === null) parent.children.delete(ch)
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root)
  }
  return found
}
