function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): number {
  // Ignores the BST ordering: compare the full root-to-node paths.
  const pathTo = (node: TreeNode | null, target: number, path: number[]): boolean => {
    if (!node) return false
    path.push(node.val)
    if (node.val === target || pathTo(node.left, target, path) || pathTo(node.right, target, path)) return true
    path.pop()
    return false
  }
  const a: number[] = []
  const b: number[] = []
  pathTo(root, p, a)
  pathTo(root, q, b)
  let i = 0
  while (i + 1 < a.length && i + 1 < b.length && a[i + 1] === b[i + 1]) i++
  return a[i]
}
