function zigzagLevelOrder(root: TreeNode | null): number[][] {
  const out: number[][] = []
  let level: TreeNode[] = root ? [root] : []
  while (level.length) {
    const values = level.map((node) => node.val)
    out.push(out.length % 2 === 1 ? values.reverse() : values)
    const next: TreeNode[] = []
    for (const node of level) {
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next
  }
  return out
}
