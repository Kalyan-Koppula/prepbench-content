function maxPathSum(root: TreeNode | null): number {
  let best = -Infinity
  // Best sum of a downward path starting at node (0 for null).
  const gain = (node: TreeNode | null): number => {
    if (!node) return 0
    const left = Math.max(0, gain(node.left))
    const right = Math.max(0, gain(node.right))
    best = Math.max(best, node.val + left + right) // path that bends here
    return node.val + Math.max(left, right)
  }
  gain(root)
  return best
}
