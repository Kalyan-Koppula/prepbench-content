function invertTree(root: TreeNode | null): TreeNode | null {
  if (root === null) {
    return null
  }
  // Mirror both subtrees, then attach them on the opposite sides.
  const invertedLeft = invertTree(root.left)
  const invertedRight = invertTree(root.right)
  root.left = invertedRight
  root.right = invertedLeft
  return root
}
