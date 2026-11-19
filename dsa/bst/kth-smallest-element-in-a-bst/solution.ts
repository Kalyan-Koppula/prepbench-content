function kthSmallest(root: TreeNode | null, k: number): number {
  // Iterative inorder: values come out in ascending order, so stop at the k-th.
  const stack: TreeNode[] = []
  let current = root
  let seen = 0
  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current)
      current = current.left
    }
    const node = stack.pop() as TreeNode
    seen++
    if (seen === k) {
      return node.val
    }
    current = node.right
  }
  return -1 // unreachable: k <= number of nodes
}
