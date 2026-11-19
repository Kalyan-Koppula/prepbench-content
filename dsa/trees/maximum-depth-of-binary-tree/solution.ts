function maxDepth(root: TreeNode | null): number {
  if (root === null) {
    return 0
  }
  // A node adds one level on top of its deeper subtree.
  const left = maxDepth(root.left)
  const right = maxDepth(root.right)
  return 1 + (left > right ? left : right)
}
