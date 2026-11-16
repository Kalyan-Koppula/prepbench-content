function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  if (!preorder.length) return null
  const rootVal = preorder[0]
  const mid = inorder.indexOf(rootVal)
  return new TreeNode(
    rootVal,
    buildTree(preorder.slice(1, mid + 1), inorder.slice(0, mid)),
    buildTree(preorder.slice(mid + 1), inorder.slice(mid + 1)),
  )
}
