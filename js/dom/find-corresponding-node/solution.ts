function findCorrespondingNode(rootA: Node, rootB: Node, target: Node): Node | null {
  // Record the child index at each level on the way up to rootA.
  const path: number[] = []
  let node: Node = target
  while (node !== rootA) {
    const parent = node.parentNode
    if (!parent) return null // reached the top without meeting rootA
    path.push(Array.prototype.indexOf.call(parent.childNodes, node))
    node = parent
  }

  // Replay the indexes from rootB, outermost first.
  let match: Node | null = rootB
  for (let i = path.length - 1; i >= 0 && match; i--) match = match.childNodes[path[i]] ?? null
  return match
}
