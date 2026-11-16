function rightSideView(root: TreeNode | null): number[] {
  const out: number[] = []
  const dfs = (node: TreeNode | null, depth: number) => {
    if (!node) return
    // First node reached at a new depth is the rightmost one.
    if (depth === out.length) out.push(node.val)
    dfs(node.right, depth + 1)
    dfs(node.left, depth + 1)
  }
  dfs(root, 0)
  return out
}
