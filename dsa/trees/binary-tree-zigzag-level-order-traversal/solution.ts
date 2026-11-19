function zigzagLevelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = []
  if (root === null) {
    return result
  }
  let level: TreeNode[] = [root]
  let leftToRight = true
  while (level.length > 0) {
    // Fill this level's values from the front or the back depending on direction.
    const values: number[] = new Array(level.length)
    for (let i = 0; i < level.length; i++) {
      const position = leftToRight ? i : level.length - 1 - i
      values[position] = level[i].val
    }
    result.push(values)

    // The next level is always collected left to right.
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
    leftToRight = !leftToRight
  }
  return result
}
