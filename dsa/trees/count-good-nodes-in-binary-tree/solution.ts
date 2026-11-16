function goodNodes(root: TreeNode | null): number {
  const dfs = (node: TreeNode | null, maxSoFar: number): number => {
    if (!node) return 0
    const good = node.val >= maxSoFar ? 1 : 0
    const nextMax = Math.max(maxSoFar, node.val)
    return good + dfs(node.left, nextMax) + dfs(node.right, nextMax)
  }
  return dfs(root, -Infinity)
}
