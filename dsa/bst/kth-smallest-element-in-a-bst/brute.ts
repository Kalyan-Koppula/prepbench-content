function kthSmallest(root: TreeNode | null, k: number): number {
  const vals: number[] = []
  const collect = (node: TreeNode | null) => {
    if (!node) return
    vals.push(node.val)
    collect(node.left)
    collect(node.right)
  }
  collect(root)
  vals.sort((a, b) => a - b)
  return vals[k - 1]
}
