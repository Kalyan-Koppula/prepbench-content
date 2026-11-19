function bstFromPreorder(preorder: number[]): TreeNode | null {
  const next = [0] // index of the next unused preorder value

  // Build the subtree that holds the upcoming values smaller than `bound`.
  function build(bound: number): TreeNode | null {
    if (next[0] === preorder.length || preorder[next[0]] > bound) {
      return null // the next value belongs to an ancestor's right side
    }
    const node = new TreeNode(preorder[next[0]])
    next[0]++
    node.left = build(node.val) // left subtree: values below this node
    node.right = build(bound) // right subtree: the rest below the old bound
    return node
  }

  return build(Infinity)
}
