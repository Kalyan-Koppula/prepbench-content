function sameTree(a: TreeNode | null, b: TreeNode | null): boolean {
  if (a === null && b === null) {
    return true
  }
  if (a === null || b === null) {
    return false
  }
  if (a.val !== b.val) {
    return false
  }
  return sameTree(a.left, b.left) && sameTree(a.right, b.right)
}

function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  if (root === null) {
    return false
  }
  // Either the tree rooted here matches, or the match is further down.
  if (sameTree(root, subRoot)) {
    return true
  }
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot)
}
