function verticalTraversal(root: TreeNode | null): number[][] {
  const cells: [number, number, number][] = [] // [col, row, val]
  const dfs = (node: TreeNode | null, row: number, col: number) => {
    if (!node) return
    cells.push([col, row, node.val])
    dfs(node.left, row + 1, col - 1)
    dfs(node.right, row + 1, col + 1)
  }
  dfs(root, 0, 0)
  cells.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])

  const out: number[][] = []
  let prevCol: number | null = null
  for (const [col, , val] of cells) {
    if (col !== prevCol) {
      out.push([])
      prevCol = col
    }
    out[out.length - 1].push(val)
  }
  return out
}
