function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const indexOf = new Map<number, number>()
  inorder.forEach((v, i) => indexOf.set(v, i))
  let pre = 0

  // Builds the subtree whose values occupy inorder[lo..hi].
  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null
    const node = new TreeNode(preorder[pre++])
    const mid = indexOf.get(node.val)!
    node.left = build(lo, mid - 1)
    node.right = build(mid + 1, hi)
    return node
  }
  return build(0, inorder.length - 1)
}
