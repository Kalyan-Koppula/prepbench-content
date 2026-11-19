// Returns: null if neither target is in this subtree, the target node if only
// one is, or the lowest common ancestor once both have been found below.
function findLca(node: TreeNode | null, p: number, q: number): TreeNode | null {
  if (node === null) {
    return null
  }
  if (node.val === p || node.val === q) {
    return node // the other target may be below; either way this node is the answer for this branch
  }
  const left = findLca(node.left, p, q)
  const right = findLca(node.right, p, q)
  if (left !== null && right !== null) {
    return node // one target on each side: this is where the paths split
  }
  return left !== null ? left : right
}

function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): number {
  const lca = findLca(root, p, q) as TreeNode // both values are guaranteed to exist
  return lca.val
}
