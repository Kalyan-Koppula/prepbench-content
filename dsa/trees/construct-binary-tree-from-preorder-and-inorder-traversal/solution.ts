function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  // Where each value sits in inorder, so splitting a range is O(1).
  const inorderIndex = new Map<number, number>()
  for (let i = 0; i < inorder.length; i++) {
    inorderIndex.set(inorder[i], i)
  }
  const nextPre = [0] // next unused position in preorder

  // Build the subtree whose values are exactly inorder[lo..hi].
  function build(lo: number, hi: number): TreeNode | null {
    if (lo > hi) {
      return null
    }
    // Preorder lists a subtree's root before anything else in it.
    const rootVal = preorder[nextPre[0]]
    nextPre[0]++
    const node = new TreeNode(rootVal)
    const mid = inorderIndex.get(rootVal) as number
    // Left subtree first: preorder lists all of it before the right subtree.
    node.left = build(lo, mid - 1)
    node.right = build(mid + 1, hi)
    return node
  }

  return build(0, inorder.length - 1)
}
