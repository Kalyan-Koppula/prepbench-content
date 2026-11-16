function invertTree(root: TreeNode | null): TreeNode | null {
  const queue: TreeNode[] = root ? [root] : []
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]
    const tmp = node.left
    node.left = node.right
    node.right = tmp
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return root
}
