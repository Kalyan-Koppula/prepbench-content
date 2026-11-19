// Every value in this subtree must lie strictly between low and high.
function isWithin(node: TreeNode | null, low: number, high: number): boolean {
  if (node === null) {
    return true
  }
  if (node.val <= low || node.val >= high) {
    return false
  }
  // Going left, this node becomes the upper bound; going right, the lower bound.
  return isWithin(node.left, low, node.val) && isWithin(node.right, node.val, high)
}

function isValidBST(root: TreeNode | null): boolean {
  return isWithin(root, -Infinity, Infinity)
}
