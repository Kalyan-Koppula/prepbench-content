function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  // Recursive version: insert into the correct subtree and re-attach it.
  if (root === null) {
    return new TreeNode(val)
  }
  if (val < root.val) {
    root.left = insertIntoBST(root.left, val)
  } else {
    root.right = insertIntoBST(root.right, val)
  }
  return root
}
