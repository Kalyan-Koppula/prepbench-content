function visit(node: TreeNode | null, result: number[]): void {
  if (node === null) {
    return
  }
  visit(node.left, result)
  result.push(node.val)
  visit(node.right, result)
}

function inorderTraversal(root: TreeNode | null): number[] {
  // Recursive version: left, node, right.
  const result: number[] = []
  visit(root, result)
  return result
}
