function allLess(node: TreeNode | null, limit: number): boolean {
  if (node === null) {
    return true
  }
  return node.val < limit && allLess(node.left, limit) && allLess(node.right, limit)
}

function allGreater(node: TreeNode | null, limit: number): boolean {
  if (node === null) {
    return true
  }
  return node.val > limit && allGreater(node.left, limit) && allGreater(node.right, limit)
}

function isValidBST(root: TreeNode | null): boolean {
  // At every node, scan both whole subtrees against it: O(n^2) worst case.
  if (root === null) {
    return true
  }
  if (!allLess(root.left, root.val) || !allGreater(root.right, root.val)) {
    return false
  }
  return isValidBST(root.left) && isValidBST(root.right)
}
