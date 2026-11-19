function invertTree(root: TreeNode | null): TreeNode | null {
  // Iterative BFS: swap the children of every node, level by level.
  if (root === null) {
    return null
  }
  const queue: TreeNode[] = [root]
  let head = 0
  while (head < queue.length) {
    const node = queue[head]
    head++
    const temp = node.left
    node.left = node.right
    node.right = temp
    if (node.left !== null) {
      queue.push(node.left)
    }
    if (node.right !== null) {
      queue.push(node.right)
    }
  }
  return root
}
