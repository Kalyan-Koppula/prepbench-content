// Returns the best sum of a path that starts at `node` and goes down one side.
// Records in best[0] the best path that bends at any node in this subtree.
function maxGain(node: TreeNode | null, best: number[]): number {
  if (node === null) {
    return 0
  }
  // A negative branch would only lower the sum, so treat it as 0 (don't take it).
  let left = maxGain(node.left, best)
  if (left < 0) {
    left = 0
  }
  let right = maxGain(node.right, best)
  if (right < 0) {
    right = 0
  }
  // The best path whose highest node is this one uses both branches.
  if (node.val + left + right > best[0]) {
    best[0] = node.val + left + right
  }
  // A path continuing up to the parent can only use one branch.
  return node.val + (left > right ? left : right)
}

function maxPathSum(root: TreeNode | null): number {
  const best = [-Infinity]
  maxGain(root, best)
  return best[0]
}
