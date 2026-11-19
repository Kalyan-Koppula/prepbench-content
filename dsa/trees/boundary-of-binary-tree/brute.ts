// One preorder walk with flags. Left-edge nodes are recorded on the way down,
// right-edge nodes on the way back up (which makes them bottom-up).
function walk(node: TreeNode | null, onLeft: boolean, onRight: boolean, before: number[], after: number[]): void {
  if (node === null) {
    return
  }
  if (node.left === null && node.right === null) {
    before.push(node.val) // a leaf
    return
  }
  if (onLeft) {
    before.push(node.val)
  }
  // A child stays on the left edge if it is the left child, or the right child of a node with no left child.
  walk(node.left, onLeft, onRight && node.right === null, before, after)
  walk(node.right, onLeft && node.left === null, onRight, before, after)
  if (onRight) {
    after.push(node.val)
  }
}

function boundaryOfBinaryTree(root: TreeNode | null): number[] {
  if (root === null) {
    return []
  }
  const before: number[] = []
  const after: number[] = []
  walk(root.left, true, false, before, after)
  walk(root.right, false, true, before, after)
  const result: number[] = [root.val]
  for (let i = 0; i < before.length; i++) {
    result.push(before[i])
  }
  for (let i = 0; i < after.length; i++) {
    result.push(after[i])
  }
  return result
}
