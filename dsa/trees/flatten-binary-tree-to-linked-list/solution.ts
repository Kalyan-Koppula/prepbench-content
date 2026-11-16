function flatten(root: TreeNode | null): void {
  let cur = root
  while (cur) {
    if (cur.left) {
      // The left subtree's rightmost node is the last one in its preorder.
      let pred = cur.left
      while (pred.right) pred = pred.right
      pred.right = cur.right
      cur.right = cur.left
      cur.left = null
    }
    cur = cur.right
  }
}
