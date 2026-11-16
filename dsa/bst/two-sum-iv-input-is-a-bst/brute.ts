function findTarget(root: TreeNode | null, k: number): boolean {
  const vals: number[] = []
  const stack: TreeNode[] = root ? [root] : []
  while (stack.length) {
    const node = stack.pop()!
    vals.push(node.val)
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  for (let i = 0; i < vals.length; i++)
    for (let j = i + 1; j < vals.length; j++) if (vals[i] + vals[j] === k) return true
  return false
}
