function rightSideView(root: TreeNode | null): number[] {
  // BFS level by level; the last node of each level is visible.
  const result: number[] = []
  if (root === null) {
    return result
  }
  let level: TreeNode[] = [root]
  while (level.length > 0) {
    result.push(level[level.length - 1].val)
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
  return result
}
