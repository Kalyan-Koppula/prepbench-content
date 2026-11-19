class BSTIterator {
  // Nodes whose left side is done but which haven't been returned yet.
  // The top is always the smallest value not returned so far.
  stack: TreeNode[]

  constructor(root: TreeNode | null) {
    this.stack = []
    this.pushLeftPath(root)
  }

  pushLeftPath(node: TreeNode | null): void {
    let current = node
    while (current !== null) {
      this.stack.push(current)
      current = current.left
    }
  }

  next(): number {
    const node = this.stack.pop() as TreeNode
    // Its right subtree holds the next values; queue its leftmost path.
    this.pushLeftPath(node.right)
    return node.val
  }

  hasNext(): boolean {
    return this.stack.length > 0
  }
}
