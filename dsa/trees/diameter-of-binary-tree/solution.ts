// Returns the height of `node` (in nodes) and records in best[0] the longest
// path, in edges, that bends at any node below it.
function heightAndDiameter(node: TreeNode | null, best: number[]): number {
  if (node === null) {
    return 0
  }
  const left = heightAndDiameter(node.left, best)
  const right = heightAndDiameter(node.right, best)
  // The longest path through this node goes down both sides: left + right edges.
  if (left + right > best[0]) {
    best[0] = left + right
  }
  return 1 + (left > right ? left : right)
}

function diameterOfBinaryTree(root: TreeNode | null): number {
  const best = [0]
  heightAndDiameter(root, best)
  return best[0]
}
