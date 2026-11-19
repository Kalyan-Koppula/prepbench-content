function collect(node: TreeNode | null, depth: number, result: number[][]): void {
  if (node === null) {
    return
  }
  if (result.length === depth) {
    result.push([]) // first node seen at this depth
  }
  result[depth].push(node.val)
  // Left before right keeps each level in left-to-right order.
  collect(node.left, depth + 1, result)
  collect(node.right, depth + 1, result)
}

function levelOrder(root: TreeNode | null): number[][] {
  // DFS that files each value under its depth.
  const result: number[][] = []
  collect(root, 0, result)
  return result
}
