function collect(node: TreeNode | null, nodes: TreeNode[]): void {
  if (node === null) {
    return
  }
  collect(node.left, nodes)
  nodes.push(node)
  collect(node.right, nodes)
}

function recoverTree(root: TreeNode | null): void {
  // Inorder the nodes, sort their values, and write the values back in order.
  // O(n log n) time, O(n) space.
  const nodes: TreeNode[] = []
  collect(root, nodes)
  const values: number[] = []
  for (let i = 0; i < nodes.length; i++) {
    values.push(nodes[i].val)
  }
  values.sort((a, b) => a - b)
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].val = values[i]
  }
}
