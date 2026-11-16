function bstFromPreorder(preorder: number[]): TreeNode | null {
  const insert = (node: TreeNode | null, val: number): TreeNode => {
    if (!node) return new TreeNode(val)
    if (val < node.val) node.left = insert(node.left, val)
    else node.right = insert(node.right, val)
    return node
  }
  let root: TreeNode | null = null
  for (const v of preorder) root = insert(root, v)
  return root
}
