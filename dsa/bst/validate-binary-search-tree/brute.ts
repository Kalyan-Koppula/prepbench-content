function isValidBST(root: TreeNode | null): boolean {
  const values = (node: TreeNode | null): number[] => (node ? [node.val, ...values(node.left), ...values(node.right)] : [])
  if (!root) return true
  if (values(root.left).some((v) => v >= root.val)) return false
  if (values(root.right).some((v) => v <= root.val)) return false
  return isValidBST(root.left) && isValidBST(root.right)
}
