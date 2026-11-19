// Count good nodes below `node`, given the largest value on the path above it.
function countGood(node: TreeNode | null, maxAbove: number): number {
  if (node === null) {
    return 0
  }
  let count = 0
  if (node.val >= maxAbove) {
    count = 1 // nothing on the path is bigger
  }
  const maxHere = node.val > maxAbove ? node.val : maxAbove
  count += countGood(node.left, maxHere)
  count += countGood(node.right, maxHere)
  return count
}

function goodNodes(root: TreeNode | null): number {
  return countGood(root, -Infinity)
}
