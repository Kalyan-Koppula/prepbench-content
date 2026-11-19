function maxDepth(root: TreeNode | null): number {
  // Iterative BFS: count how many levels there are.
  if (root === null) {
    return 0
  }
  let depth = 0
  let level: TreeNode[] = [root]
  while (level.length > 0) {
    depth++
    const next: TreeNode[] = []
    for (let i = 0; i < level.length; i++) {
      const node = level[i]
      if (node.left !== null) {
        next.push(node.left)
      }
      if (node.right !== null) {
        next.push(node.right)
      }
    }
    level = next
  }
  return depth
}
