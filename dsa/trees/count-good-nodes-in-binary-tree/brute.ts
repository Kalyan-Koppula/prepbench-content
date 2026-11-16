function goodNodes(root: TreeNode | null): number {
  // Collect every root-to-node path explicitly, then check each node against its path.
  let count = 0
  const path: number[] = []
  const walk = (node: TreeNode | null) => {
    if (!node) return
    path.push(node.val)
    if (path.every((v) => v <= node.val)) count++
    walk(node.left)
    walk(node.right)
    path.pop()
  }
  walk(root)
  return count
}
