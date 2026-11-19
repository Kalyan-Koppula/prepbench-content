class BSTIterator {
  // Flatten the whole tree up front: O(1) per call, but O(n) memory.
  values: number[]
  index: number

  constructor(root: TreeNode | null) {
    this.values = []
    this.index = 0
    this.collect(root)
  }

  collect(node: TreeNode | null): void {
    if (node === null) {
      return
    }
    this.collect(node.left)
    this.values.push(node.val)
    this.collect(node.right)
  }

  next(): number {
    const value = this.values[this.index]
    this.index++
    return value
  }

  hasNext(): boolean {
    return this.index < this.values.length
  }
}
