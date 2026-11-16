function isBalanced(root: TreeNode | null): boolean {
  const height = (node: TreeNode | null): number => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0)
  if (!root) return true
  if (Math.abs(height(root.left) - height(root.right)) > 1) return false
  return isBalanced(root.left) && isBalanced(root.right)
}
