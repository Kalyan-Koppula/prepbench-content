function collect(node: TreeNode | null, depth: number, levels: number[][]): void {
  if (node === null) {
    return
  }
  if (levels.length === depth) {
    levels.push([])
  }
  levels[depth].push(node.val)
  collect(node.left, depth + 1, levels)
  collect(node.right, depth + 1, levels)
}

function zigzagLevelOrder(root: TreeNode | null): number[][] {
  // Ordinary level order by DFS, then reverse every odd level.
  const levels: number[][] = []
  collect(root, 0, levels)
  for (let d = 1; d < levels.length; d += 2) {
    const row = levels[d]
    let i = 0
    let j = row.length - 1
    while (i < j) {
      const temp = row[i]
      row[i] = row[j]
      row[j] = temp
      i++
      j--
    }
  }
  return levels
}
