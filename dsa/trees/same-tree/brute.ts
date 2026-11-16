function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  const serialise = (root: TreeNode | null): string => {
    const out: string[] = []
    const queue: (TreeNode | null)[] = [root]
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i]
      if (!node) {
        out.push('#')
        continue
      }
      out.push(String(node.val))
      queue.push(node.left, node.right)
    }
    return out.join(',')
  }
  return serialise(p) === serialise(q)
}
