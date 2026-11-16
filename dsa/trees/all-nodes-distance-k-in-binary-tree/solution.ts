function distanceK(root: TreeNode | null, target: number, k: number): number[] {
  const parent = new Map<TreeNode, TreeNode | null>()
  let start: TreeNode | null = null
  const stack: TreeNode[] = root ? [root] : []
  if (root) parent.set(root, null)
  while (stack.length) {
    const node = stack.pop()!
    if (node.val === target) start = node
    for (const child of [node.left, node.right]) {
      if (child) {
        parent.set(child, node)
        stack.push(child)
      }
    }
  }
  if (!start) return []

  // BFS outward over left / right / parent edges.
  const visited = new Set<TreeNode>([start])
  let frontier: TreeNode[] = [start]
  for (let dist = 0; dist < k && frontier.length; dist++) {
    const next: TreeNode[] = []
    for (const node of frontier) {
      for (const nb of [node.left, node.right, parent.get(node) ?? null]) {
        if (nb && !visited.has(nb)) {
          visited.add(nb)
          next.push(nb)
        }
      }
    }
    frontier = next
  }
  return frontier.map((node) => node.val)
}
