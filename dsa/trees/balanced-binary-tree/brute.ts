function height(node: TreeNode | null): number {
  if (node === null) {
    return 0
  }
  const left = height(node.left)
  const right = height(node.right)
  return 1 + (left > right ? left : right)
}

function isBalanced(root: TreeNode | null): boolean {
  // Check every node with fresh height computations: O(n^2) on a chain.
  if (root === null) {
    return true
  }
  if (Math.abs(height(root.left) - height(root.right)) > 1) {
    return false
  }
  return isBalanced(root.left) && isBalanced(root.right)
}
