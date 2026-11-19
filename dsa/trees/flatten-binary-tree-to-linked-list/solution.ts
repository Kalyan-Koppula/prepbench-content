function flatten(root: TreeNode | null): void {
  let current = root
  while (current !== null) {
    if (current.left !== null) {
      // The rightmost node of the left subtree comes last in its preorder.
      // The right subtree must follow it, so hang it there.
      let rightmost: TreeNode = current.left
      while (rightmost.right !== null) {
        rightmost = rightmost.right
      }
      rightmost.right = current.right
      // Move the left subtree into the right slot.
      current.right = current.left
      current.left = null
    }
    current = current.right
  }
}
