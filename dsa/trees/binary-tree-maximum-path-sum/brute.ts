// Best downward path starting at node, recomputed from scratch each time.
function down(node: TreeNode | null): number {
  if (node === null) {
    return 0
  }
  const left = down(node.left)
  const right = down(node.right)
  let bestChild = left > right ? left : right
  if (bestChild < 0) {
    bestChild = 0
  }
  return node.val + bestChild
}

function maxPathSum(root: TreeNode | null): number {
  // Try every node as the highest point of the path: O(n^2) worst case.
  if (root === null) {
    return -Infinity
  }
  let left = down(root.left)
  if (left < 0) {
    left = 0
  }
  let right = down(root.right)
  if (right < 0) {
    right = 0
  }
  let best = root.val + left + right
  if (root.left !== null) {
    const inLeft = maxPathSum(root.left)
    if (inLeft > best) {
      best = inLeft
    }
  }
  if (root.right !== null) {
    const inRight = maxPathSum(root.right)
    if (inRight > best) {
      best = inRight
    }
  }
  return best
}
