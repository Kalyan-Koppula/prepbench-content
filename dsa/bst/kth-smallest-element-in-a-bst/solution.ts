function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = []
  let cur = root
  while (cur || stack.length) {
    while (cur) {
      stack.push(cur)
      cur = cur.left
    }
    cur = stack.pop()!
    if (--k === 0) return cur.val
    cur = cur.right
  }
  return -1
}
