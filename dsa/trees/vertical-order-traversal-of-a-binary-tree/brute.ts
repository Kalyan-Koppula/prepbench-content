function verticalTraversal(root: TreeNode | null): number[][] {
  // BFS to get every node's row and column.
  const rows: number[] = []
  const cols: number[] = []
  const vals: number[] = []
  if (root !== null) {
    let level: TreeNode[] = [root]
    let levelCols: number[] = [0]
    let row = 0
    while (level.length > 0) {
      const next: TreeNode[] = []
      const nextCols: number[] = []
      for (let i = 0; i < level.length; i++) {
        const node = level[i]
        rows.push(row)
        cols.push(levelCols[i])
        vals.push(node.val)
        if (node.left !== null) {
          next.push(node.left)
          nextCols.push(levelCols[i] - 1)
        }
        if (node.right !== null) {
          next.push(node.right)
          nextCols.push(levelCols[i] + 1)
        }
      }
      level = next
      levelCols = nextCols
      row++
    }
  }
  let minCol = 0
  let maxCol = 0
  for (let i = 0; i < cols.length; i++) {
    if (cols[i] < minCol) {
      minCol = cols[i]
    }
    if (cols[i] > maxCol) {
      maxCol = cols[i]
    }
  }
  // For each column, pick its nodes and order them with insertion sort.
  const result: number[][] = []
  for (let c = minCol; c <= maxCol; c++) {
    const picked: number[] = []
    for (let i = 0; i < vals.length; i++) {
      if (cols[i] === c) {
        let j = picked.length
        picked.push(i)
        while (j > 0) {
          const p = picked[j - 1]
          const before = rows[p] > rows[i] || (rows[p] === rows[i] && vals[p] > vals[i])
          if (!before) {
            break
          }
          picked[j] = p
          j--
        }
        picked[j] = i
      }
    }
    const column: number[] = []
    for (let k = 0; k < picked.length; k++) {
      column.push(vals[picked[k]])
    }
    result.push(column)
  }
  return result
}
