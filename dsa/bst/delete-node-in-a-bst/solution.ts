function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (root === null) {
    return null // key not found
  }
  if (key < root.val) {
    root.left = deleteNode(root.left, key)
    return root
  }
  if (key > root.val) {
    root.right = deleteNode(root.right, key)
    return root
  }
  // root is the node to delete.
  if (root.left === null) {
    return root.right // zero or one child: splice it out
  }
  if (root.right === null) {
    return root.left
  }
  // Two children: copy in the inorder successor (smallest value on the right),
  // then delete that successor from the right subtree. It has no left child.
  let successor: TreeNode = root.right
  while (successor.left !== null) {
    successor = successor.left
  }
  root.val = successor.val
  root.right = deleteNode(root.right, successor.val)
  return root
}
