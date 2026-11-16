function maxDepth(root: TreeNode | null): number {
  let depth = 0
  let level = root ? [root] : []
  while (level.length) {
    depth++
    const next: TreeNode[] = []
    for (const node of level) {
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next
  }
  return depth
}
