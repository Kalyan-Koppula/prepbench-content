function collect(node: TreeNode | null, values: number[]): void {
  if (node === null) {
    return
  }
  values.push(node.val)
  collect(node.left, values)
  collect(node.right, values)
}

function findTarget(root: TreeNode | null, k: number): boolean {
  // Check every pair of values: O(n^2).
  const values: number[] = []
  collect(root, values)
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] + values[j] === k) {
        return true
      }
    }
  }
  return false
}
