function distanceK(root: TreeNode | null, target: number, k: number): number[] {
  if (root === null) {
    return []
  }
  // 1. Record each node's parent so we can also walk upward.
  const parent = new Map<TreeNode, TreeNode>()
  let start: TreeNode | null = null
  const stack: TreeNode[] = [root]
  while (stack.length > 0) {
    const node = stack.pop() as TreeNode
    if (node.val === target) {
      start = node
    }
    if (node.left !== null) {
      parent.set(node.left, node)
      stack.push(node.left)
    }
    if (node.right !== null) {
      parent.set(node.right, node)
      stack.push(node.right)
    }
  }
  if (start === null) {
    return []
  }

  // 2. BFS outward from the target over left, right and parent edges.
  const visited = new Set<TreeNode>()
  visited.add(start)
  let frontier: TreeNode[] = [start]
  for (let distance = 0; distance < k && frontier.length > 0; distance++) {
    const next: TreeNode[] = []
    for (let i = 0; i < frontier.length; i++) {
      const node = frontier[i]
      const up = parent.get(node)
      const neighbours: Array<TreeNode | null> = [node.left, node.right, up === undefined ? null : up]
      for (let j = 0; j < neighbours.length; j++) {
        const neighbour = neighbours[j]
        if (neighbour !== null && !visited.has(neighbour)) {
          visited.add(neighbour)
          next.push(neighbour)
        }
      }
    }
    frontier = next
  }

  const result: number[] = []
  for (let i = 0; i < frontier.length; i++) {
    result.push(frontier[i].val)
  }
  return result
}
