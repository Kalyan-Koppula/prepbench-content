function inorder(node: TreeNode | null, values: number[]): void {
  if (node === null) {
    return
  }
  inorder(node.left, values)
  values.push(node.val)
  inorder(node.right, values)
}

function findTarget(root: TreeNode | null, k: number): boolean {
  // Inorder gives the values sorted; then two pointers from both ends.
  const values: number[] = []
  inorder(root, values)
  let i = 0
  let j = values.length - 1
  while (i < j) {
    const sum = values[i] + values[j]
    if (sum === k) {
      return true
    }
    if (sum < k) {
      i++
    } else {
      j--
    }
  }
  return false
}
