function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  const node = new TreeNode(val)
  if (root === null) {
    return node
  }
  // Follow the search path and attach at the first missing child.
  let current: TreeNode = root
  while (true) {
    if (val < current.val) {
      if (current.left === null) {
        current.left = node
        return root
      }
      current = current.left
    } else {
      if (current.right === null) {
        current.right = node
        return root
      }
      current = current.right
    }
  }
}
