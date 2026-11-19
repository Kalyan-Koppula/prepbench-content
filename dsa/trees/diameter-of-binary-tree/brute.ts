function height(node: TreeNode | null): number {
  if (node === null) {
    return 0
  }
  const left = height(node.left)
  const right = height(node.right)
  return 1 + (left > right ? left : right)
}

function diameterOfBinaryTree(root: TreeNode | null): number {
  // For every node, compute both subtree heights from scratch: O(n^2) worst case.
  if (root === null) {
    return 0
  }
  const throughRoot = height(root.left) + height(root.right)
  const inLeft = diameterOfBinaryTree(root.left)
  const inRight = diameterOfBinaryTree(root.right)
  let best = throughRoot
  if (inLeft > best) {
    best = inLeft
  }
  if (inRight > best) {
    best = inRight
  }
  return best
}
