function isValidBST(root: TreeNode | null): boolean {
  // Every value in this subtree must lie strictly inside (lo, hi).
  const valid = (node: TreeNode | null, lo: number, hi: number): boolean => {
    if (!node) return true
    if (node.val <= lo || node.val >= hi) return false
    return valid(node.left, lo, node.val) && valid(node.right, node.val, hi)
  }
  return valid(root, -Infinity, Infinity)
}
