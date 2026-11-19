function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): number {
  let current = root
  while (current !== null) {
    if (p < current.val && q < current.val) {
      current = current.left // both targets are in the left subtree
    } else if (p > current.val && q > current.val) {
      current = current.right // both are in the right subtree
    } else {
      return current.val // they split here, or current is one of them
    }
  }
  return -1 // unreachable: both values are in the tree
}
