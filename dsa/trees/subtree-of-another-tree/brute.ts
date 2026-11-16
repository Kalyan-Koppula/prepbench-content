function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  const serialise = (node: TreeNode | null, out: string[]): string[] => {
    if (!node) {
      out.push(',#')
      return out
    }
    out.push(',' + node.val)
    serialise(node.left, out)
    serialise(node.right, out)
    return out
  }
  return serialise(root, []).join('').includes(serialise(subRoot, []).join(''))
}
