function recoverTree(root: TreeNode | null): void {
  // In a correct BST, inorder values always increase. Swapping two values
  // creates one "drop" (adjacent swap) or two drops (distant swap).
  let first: TreeNode | null = null // larger value of the first drop
  let second: TreeNode | null = null // smaller value of the last drop
  let prev: TreeNode | null = null
  const stack: TreeNode[] = []
  let current = root
  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current)
      current = current.left
    }
    const node = stack.pop() as TreeNode
    if (prev !== null && prev.val > node.val) {
      if (first === null) {
        first = prev
      }
      second = node
    }
    prev = node
    current = node.right
  }
  if (first !== null && second !== null) {
    const temp = first.val
    first.val = second.val
    second.val = temp
  }
}
