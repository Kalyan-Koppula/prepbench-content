class BSTIterator {
  values: number[] = []
  index = 0

  constructor(root: TreeNode | null) {
    const walk = (node: TreeNode | null) => {
      if (!node) return
      walk(node.left)
      this.values.push(node.val)
      walk(node.right)
    }
    walk(root)
  }

  next(): number {
    return this.values[this.index++]
  }

  hasNext(): boolean {
    return this.index < this.values.length
  }
}
