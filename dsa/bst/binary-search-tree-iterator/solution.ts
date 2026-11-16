class BSTIterator {
  stack: TreeNode[] = []

  constructor(root: TreeNode | null) {
    this.pushLeft(root)
  }

  // Push node and its chain of left children; the top is the smallest pending value.
  pushLeft(node: TreeNode | null) {
    while (node) {
      this.stack.push(node)
      node = node.left
    }
  }

  next(): number {
    const node = this.stack.pop()!
    this.pushLeft(node.right)
    return node.val
  }

  hasNext(): boolean {
    return this.stack.length > 0
  }
}
