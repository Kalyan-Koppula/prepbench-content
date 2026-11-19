function isLeaf(node: TreeNode): boolean {
  return node.left === null && node.right === null
}

function addLeaves(node: TreeNode | null, result: number[]): void {
  if (node === null) {
    return
  }
  if (isLeaf(node)) {
    result.push(node.val)
    return
  }
  addLeaves(node.left, result)
  addLeaves(node.right, result)
}

function boundaryOfBinaryTree(root: TreeNode | null): number[] {
  if (root === null) {
    return []
  }
  const result: number[] = [root.val]

  // 1. Left edge, top-down, stopping before its leaf.
  let current = root.left
  while (current !== null && !isLeaf(current)) {
    result.push(current.val)
    current = current.left !== null ? current.left : current.right
  }

  // 2. Leaves, left to right. The root is never counted as a leaf.
  addLeaves(root.left, result)
  addLeaves(root.right, result)

  // 3. Right edge, collected top-down and added bottom-up.
  const rightEdge: number[] = []
  current = root.right
  while (current !== null && !isLeaf(current)) {
    rightEdge.push(current.val)
    current = current.right !== null ? current.right : current.left
  }
  for (let i = rightEdge.length - 1; i >= 0; i--) {
    result.push(rightEdge[i])
  }
  return result
}
