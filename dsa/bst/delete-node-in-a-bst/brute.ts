function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  // Simpler two-children case: hang the left subtree under the smallest node
  // of the right subtree. Valid, but can make the tree much taller.
  if (root === null) {
    return null
  }
  if (key < root.val) {
    root.left = deleteNode(root.left, key)
    return root
  }
  if (key > root.val) {
    root.right = deleteNode(root.right, key)
    return root
  }
  if (root.left === null) {
    return root.right
  }
  if (root.right === null) {
    return root.left
  }
  let smallest: TreeNode = root.right
  while (smallest.left !== null) {
    smallest = smallest.left
  }
  smallest.left = root.left
  return root.right
}
