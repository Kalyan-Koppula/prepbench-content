function getTreeDepth(root: Element | null | undefined): number {
  if (!root) return 0
  // Breadth-first, one level at a time: no recursion, so very deep trees
  // can't overflow the call stack.
  let depth = 0
  let level: Element[] = [root]
  while (level.length) {
    depth++
    const next: Element[] = []
    for (const el of level) for (const child of Array.from(el.children)) next.push(child)
    level = next
  }
  return depth
}
