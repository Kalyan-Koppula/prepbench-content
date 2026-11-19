// Height of the subtree, or -1 as soon as any part of it is unbalanced.
function checkHeight(node: TreeNode | null): number {
  if (node === null) {
    return 0
  }
  const left = checkHeight(node.left)
  if (left === -1) {
    return -1
  }
  const right = checkHeight(node.right)
  if (right === -1) {
    return -1
  }
  if (Math.abs(left - right) > 1) {
    return -1
  }
  return 1 + (left > right ? left : right)
}

function isBalanced(root: TreeNode | null): boolean {
  return checkHeight(root) !== -1
}
