function diameterOfBinaryTree(root: TreeNode | null): number {
  const height = (node: TreeNode | null): number => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0)
  let best = 0
  const stack: TreeNode[] = root ? [root] : []
  while (stack.length) {
    const node = stack.pop()!
    best = Math.max(best, height(node.left) + height(node.right))
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return best
}
