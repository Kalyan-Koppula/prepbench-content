function inorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = []
  const stack: TreeNode[] = [] // nodes whose left side is being visited
  let current = root
  while (current !== null || stack.length > 0) {
    // Go as far left as possible, remembering the path.
    while (current !== null) {
      stack.push(current)
      current = current.left
    }
    // The left subtree is done: visit the node, then its right subtree.
    const node = stack.pop() as TreeNode
    result.push(node.val)
    current = node.right
  }
  return result
}
