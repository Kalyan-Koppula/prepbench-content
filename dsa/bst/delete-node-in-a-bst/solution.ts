function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (!root) return null
  if (key < root.val) {
    root.left = deleteNode(root.left, key)
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key)
  } else {
    if (!root.left) return root.right
    if (!root.right) return root.left
    // Two children: pull up the in-order successor, then delete it below.
    let succ = root.right
    while (succ.left) succ = succ.left
    root.val = succ.val
    root.right = deleteNode(root.right, succ.val)
  }
  return root
}
