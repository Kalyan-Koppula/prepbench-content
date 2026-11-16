function maxPathSum(root: TreeNode | null): number {
  // Best downward path from a node, recomputed from scratch every time.
  const down = (node: TreeNode | null): number => {
    if (!node) return 0
    return node.val + Math.max(0, down(node.left), down(node.right))
  }
  let best = -Infinity
  const stack: TreeNode[] = root ? [root] : []
  while (stack.length) {
    const node = stack.pop()!
    best = Math.max(best, node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right)))
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return best
}
