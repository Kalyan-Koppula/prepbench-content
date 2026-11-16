function inorderTraversal(root: TreeNode | null): number[] {
  const out: number[] = []
  const stack: TreeNode[] = []
  let cur = root
  while (cur || stack.length) {
    while (cur) {
      stack.push(cur)
      cur = cur.left
    }
    cur = stack.pop()!
    out.push(cur.val)
    cur = cur.right
  }
  return out
}
