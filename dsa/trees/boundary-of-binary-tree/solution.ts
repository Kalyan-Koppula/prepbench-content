function boundaryOfBinaryTree(root: TreeNode | null): number[] {
  if (!root) return []
  const isLeaf = (node: TreeNode) => !node.left && !node.right
  const out = [root.val]

  // Left edge, top-down, excluding the leaf at its end.
  let cur = root.left
  while (cur && !isLeaf(cur)) {
    out.push(cur.val)
    cur = cur.left ?? cur.right
  }

  // Leaves, left to right. The root is never treated as a leaf.
  const addLeaves = (node: TreeNode | null) => {
    if (!node) return
    if (isLeaf(node)) {
      out.push(node.val)
      return
    }
    addLeaves(node.left)
    addLeaves(node.right)
  }
  addLeaves(root.left)
  addLeaves(root.right)

  // Right edge, collected top-down and emitted bottom-up.
  const right: number[] = []
  cur = root.right
  while (cur && !isLeaf(cur)) {
    right.push(cur.val)
    cur = cur.right ?? cur.left
  }
  for (let i = right.length - 1; i >= 0; i--) out.push(right[i])
  return out
}
