function bstFromPreorder(preorder: number[]): TreeNode | null {
  let i = 0
  // Builds the subtree whose values are all below `bound`.
  const build = (bound: number): TreeNode | null => {
    if (i === preorder.length || preorder[i] > bound) return null
    const node = new TreeNode(preorder[i++])
    node.left = build(node.val)
    node.right = build(bound)
    return node
  }
  return build(Infinity)
}
