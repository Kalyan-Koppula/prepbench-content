function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): number {
  let cur = root
  while (cur) {
    if (p < cur.val && q < cur.val) cur = cur.left
    else if (p > cur.val && q > cur.val) cur = cur.right
    else return cur.val // p and q split here (or cur is one of them)
  }
  return -1
}
