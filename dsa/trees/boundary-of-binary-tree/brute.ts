function boundaryOfBinaryTree(root: TreeNode | null): number[] {
  if (!root) return []
  const before: number[] = []
  const after: number[] = []
  // One pre-order walk with edge flags: left-edge nodes are emitted on the way
  // down, right-edge nodes on the way back up.
  const walk = (node: TreeNode | null, onLeft: boolean, onRight: boolean) => {
    if (!node) return
    if (!node.left && !node.right) {
      before.push(node.val)
      return
    }
    if (onLeft) before.push(node.val)
    walk(node.left, onLeft, onRight && !node.right)
    walk(node.right, onLeft && !node.left, onRight)
    if (onRight) after.push(node.val)
  }
  walk(root.left, true, false)
  walk(root.right, false, true)
  return [root.val, ...before, ...after]
}
