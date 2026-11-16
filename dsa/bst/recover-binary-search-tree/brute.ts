function recoverTree(root: TreeNode | null): void {
  const order: TreeNode[] = []
  const walk = (node: TreeNode | null) => {
    if (!node) return
    walk(node.left)
    order.push(node)
    walk(node.right)
  }
  walk(root)
  const sorted = order.map((n) => n.val).sort((a, b) => a - b)
  order.forEach((n, i) => (n.val = sorted[i]))
}
