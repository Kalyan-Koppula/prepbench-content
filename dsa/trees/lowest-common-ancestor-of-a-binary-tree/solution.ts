function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): number {
  // Returns the p/q node found in this subtree, or their LCA once both are found.
  const find = (node: TreeNode | null): TreeNode | null => {
    if (!node || node.val === p || node.val === q) return node
    const left = find(node.left)
    const right = find(node.right)
    if (left && right) return node
    return left ?? right
  }
  return find(root)!.val
}
