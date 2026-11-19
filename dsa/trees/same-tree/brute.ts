function serialize(root: TreeNode | null, out: string[]): void {
  // Preorder with a marker for empty children, so the shape is captured too.
  if (root === null) {
    out.push('#')
    return
  }
  out.push(String(root.val))
  serialize(root.left, out)
  serialize(root.right, out)
}

function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  const a: string[] = []
  const b: string[] = []
  serialize(p, a)
  serialize(q, b)
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
