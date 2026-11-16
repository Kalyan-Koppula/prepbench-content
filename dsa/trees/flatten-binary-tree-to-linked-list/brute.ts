function flatten(root: TreeNode | null): void {
  const order: TreeNode[] = []
  const pre = (node: TreeNode | null) => {
    if (!node) return
    order.push(node)
    pre(node.left)
    pre(node.right)
  }
  pre(root)
  for (let i = 0; i < order.length; i++) {
    order[i].left = null
    order[i].right = order[i + 1] ?? null
  }
}
