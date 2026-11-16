function zigzagLevelOrder(root: TreeNode | null): number[][] {
  const levels: number[][] = []
  const dfs = (node: TreeNode | null, depth: number) => {
    if (!node) return
    if (!levels[depth]) levels[depth] = []
    levels[depth].push(node.val)
    dfs(node.left, depth + 1)
    dfs(node.right, depth + 1)
  }
  dfs(root, 0)
  return levels.map((vals, d) => (d % 2 ? [...vals].reverse() : vals))
}
