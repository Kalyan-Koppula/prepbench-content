function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  const same = (a: TreeNode | null, b: TreeNode | null): boolean => {
    if (!a && !b) return true
    if (!a || !b || a.val !== b.val) return false
    return same(a.left, b.left) && same(a.right, b.right)
  }
  if (!root) return false
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot)
}
