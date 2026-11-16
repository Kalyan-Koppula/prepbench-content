function levelOrder(root: TreeNode | null): number[][] {
  const out: number[][] = []
  const dfs = (node: TreeNode | null, depth: number) => {
    if (!node) return
    if (!out[depth]) out[depth] = []
    out[depth].push(node.val)
    dfs(node.left, depth + 1)
    dfs(node.right, depth + 1)
  }
  dfs(root, 0)
  return out
}
