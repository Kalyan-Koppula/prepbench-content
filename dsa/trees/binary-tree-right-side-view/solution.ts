function viewFromRight(node: TreeNode | null, depth: number, result: number[]): void {
  if (node === null) {
    return
  }
  // Visiting right before left, the first node reached at each depth is the rightmost.
  if (depth === result.length) {
    result.push(node.val)
  }
  viewFromRight(node.right, depth + 1, result)
  viewFromRight(node.left, depth + 1, result)
}

function rightSideView(root: TreeNode | null): number[] {
  const result: number[] = []
  viewFromRight(root, 0, result)
  return result
}
