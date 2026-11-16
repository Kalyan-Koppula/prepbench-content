function recoverTree(root: TreeNode | null): void {
  let first: TreeNode | null = null
  let second: TreeNode | null = null
  let prev: TreeNode | null = null
  const stack: TreeNode[] = []
  let cur = root
  while (cur || stack.length) {
    while (cur) {
      stack.push(cur)
      cur = cur.left
    }
    cur = stack.pop()!
    if (prev && prev.val > cur.val) {
      if (!first) first = prev // larger value of the first break
      second = cur // smaller value of the last break
    }
    prev = cur
    cur = cur.right
  }
  if (first && second) [first.val, second.val] = [second.val, first.val]
}
