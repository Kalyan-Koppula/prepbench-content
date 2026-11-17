type FilterResult = 'accept' | 'skip' | 'reject'

interface WalkOptions {
  order?: 'depth' | 'breadth'
  filter?: (node: Node) => FilterResult
}

function* walk(root: Node, options: WalkOptions = {}): Generator<Node, void, undefined> {
  // TODO
}
