function record(node: TreeNode | null, row: number, col: number, rows: number[], cols: number[], vals: number[]): void {
  if (node === null) {
    return
  }
  rows.push(row)
  cols.push(col)
  vals.push(node.val)
  record(node.left, row + 1, col - 1, rows, cols, vals)
  record(node.right, row + 1, col + 1, rows, cols, vals)
}

function verticalTraversal(root: TreeNode | null): number[][] {
  // Record (row, col, value) for every node.
  const rows: number[] = []
  const cols: number[] = []
  const vals: number[] = []
  record(root, 0, 0, rows, cols, vals)

  // Sort node indices by column, then row, then value.
  const order: number[] = []
  for (let i = 0; i < vals.length; i++) {
    order.push(i)
  }
  order.sort((a, b) => {
    if (cols[a] !== cols[b]) {
      return cols[a] - cols[b]
    }
    if (rows[a] !== rows[b]) {
      return rows[a] - rows[b]
    }
    return vals[a] - vals[b]
  })

  // Cut the sorted list into columns.
  const result: number[][] = []
  for (let k = 0; k < order.length; k++) {
    const i = order[k]
    if (k === 0 || cols[i] !== cols[order[k - 1]]) {
      result.push([])
    }
    result[result.length - 1].push(vals[i])
  }
  return result
}
