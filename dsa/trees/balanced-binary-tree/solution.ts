function isBalanced(root: TreeNode | null): boolean {
  // Height of the subtree, or -1 if it is already unbalanced.
  const check = (node: TreeNode | null): number => {
    if (!node) return 0
    const l = check(node.left)
    if (l === -1) return -1
    const r = check(node.right)
    if (r === -1 || Math.abs(l - r) > 1) return -1
    return 1 + Math.max(l, r)
  }
  return check(root) !== -1
}
