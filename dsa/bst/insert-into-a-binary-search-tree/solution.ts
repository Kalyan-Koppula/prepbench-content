function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  const node = new TreeNode(val)
  if (!root) return node
  let cur = root
  while (true) {
    if (val < cur.val) {
      if (!cur.left) {
        cur.left = node
        break
      }
      cur = cur.left
    } else {
      if (!cur.right) {
        cur.right = node
        break
      }
      cur = cur.right
    }
  }
  return root
}
