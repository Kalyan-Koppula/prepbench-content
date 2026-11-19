function levelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = []
  if (root === null) {
    return result
  }
  let level: TreeNode[] = [root]
  while (level.length > 0) {
    const values: number[] = []
    const next: TreeNode[] = []
    for (let i = 0; i < level.length; i++) {
      const node = level[i]
      values.push(node.val)
      // Children are added left to right, so the next level stays in order.
      if (node.left !== null) {
        next.push(node.left)
      }
      if (node.right !== null) {
        next.push(node.right)
      }
    }
    result.push(values)
    level = next
  }
  return result
}
