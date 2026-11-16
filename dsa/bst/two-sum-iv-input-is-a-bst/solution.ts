function findTarget(root: TreeNode | null, k: number): boolean {
  const vals: number[] = []
  const inorder = (node: TreeNode | null) => {
    if (!node) return
    inorder(node.left)
    vals.push(node.val)
    inorder(node.right)
  }
  inorder(root)

  let i = 0
  let j = vals.length - 1
  while (i < j) {
    const sum = vals[i] + vals[j]
    if (sum === k) return true
    if (sum < k) i++
    else j--
  }
  return false
}
