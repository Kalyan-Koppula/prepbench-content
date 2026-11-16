function verticalTraversal(root: TreeNode | null): number[][] {
  const nodes: { row: number; col: number; val: number }[] = []
  let level: { node: TreeNode; col: number }[] = root ? [{ node: root, col: 0 }] : []
  for (let row = 0; level.length; row++) {
    const next: { node: TreeNode; col: number }[] = []
    for (const { node, col } of level) {
      nodes.push({ row, col, val: node.val })
      if (node.left) next.push({ node: node.left, col: col - 1 })
      if (node.right) next.push({ node: node.right, col: col + 1 })
    }
    level = next
  }
  const cols = nodes.map((n) => n.col)
  const out: number[][] = []
  for (let c = Math.min(...cols); c <= Math.max(...cols); c++) {
    const column = nodes.filter((n) => n.col === c)
    column.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.val - b.val))
    out.push(column.map((n) => n.val))
  }
  return out
}
