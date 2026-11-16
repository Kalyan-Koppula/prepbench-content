function distanceK(root: TreeNode | null, target: number, k: number): number[] {
  // Record every node's root path, then distance = depth(a) + depth(b) - 2 * depth(lca).
  const paths: number[][] = []
  const walk = (node: TreeNode | null, path: number[]) => {
    if (!node) return
    const here = [...path, node.val]
    paths.push(here)
    walk(node.left, here)
    walk(node.right, here)
  }
  walk(root, [])
  const t = paths.find((p) => p[p.length - 1] === target)!
  const out: number[] = []
  for (const p of paths) {
    let common = 0
    while (common < p.length && common < t.length && p[common] === t[common]) common++
    if (p.length + t.length - 2 * common === k) out.push(p[p.length - 1])
  }
  return out
}
