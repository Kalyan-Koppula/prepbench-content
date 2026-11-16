function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (!root) return null
  if (root.val === key) {
    if (!root.left) return root.right
    if (!root.right) return root.left
    // Hang the left subtree under the smallest node of the right subtree.
    let min = root.right
    while (min.left) min = min.left
    min.left = root.left
    return root.right
  }
  if (key < root.val) root.left = deleteNode(root.left, key)
  else root.right = deleteNode(root.right, key)
  return root
}
