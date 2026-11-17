type FilterResult = 'accept' | 'skip' | 'reject'

interface WalkOptions {
  order?: 'depth' | 'breadth'
  filter?: (node: Node) => FilterResult
}

function* walk(root: Node, options: WalkOptions = {}): Generator<Node, void, undefined> {
  const { order = 'depth', filter = () => 'accept' } = options
  const pending: Node[] = [root]

  while (pending.length) {
    // Stack for depth-first, queue for breadth-first. (shift() is O(n); a
    // head index would avoid that for very wide trees.)
    const node = order === 'breadth' ? pending.shift()! : pending.pop()!
    const verdict = filter(node)
    if (verdict === 'accept') yield node
    if (verdict === 'reject') continue

    const children = Array.from(node.childNodes)
    if (order === 'breadth') pending.push(...children)
    else for (let i = children.length - 1; i >= 0; i--) pending.push(children[i])
  }
}
