function preorder(node: TreeNode | null, order: TreeNode[]): void {
  if (node === null) {
    return
  }
  order.push(node)
  preorder(node.left, order)
  preorder(node.right, order)
}

function flatten(root: TreeNode | null): void {
  // Record the preorder, then relink the nodes in that order. O(n) extra space.
  const order: TreeNode[] = []
  preorder(root, order)
  for (let i = 0; i < order.length; i++) {
    order[i].left = null
    order[i].right = i + 1 < order.length ? order[i + 1] : null
  }
}
