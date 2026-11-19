function serialize(node: TreeNode | null, out: string[]): void {
  // Each value gets a leading comma so "2" never matches the end of "12".
  if (node === null) {
    out.push(',#')
    return
  }
  out.push(',' + node.val)
  serialize(node.left, out)
  serialize(node.right, out)
}

function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  // A subtree's preorder (with null markers) appears as a contiguous piece of
  // the whole tree's preorder, and only then.
  const whole: string[] = []
  const part: string[] = []
  serialize(root, whole)
  serialize(subRoot, part)
  return whole.join('').indexOf(part.join('')) !== -1
}
