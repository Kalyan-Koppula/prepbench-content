function collect(node: TreeNode | null, values: number[]): void {
  if (node === null) {
    return
  }
  values.push(node.val)
  collect(node.left, values)
  collect(node.right, values)
}

function kthSmallest(root: TreeNode | null, k: number): number {
  // Ignore the ordering: gather everything and sort. O(n log n).
  const values: number[] = []
  collect(root, values)
  values.sort((a, b) => a - b)
  return values[k - 1]
}
