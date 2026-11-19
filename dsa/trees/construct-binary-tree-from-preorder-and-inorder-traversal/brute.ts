function buildRange(preorder: number[], preStart: number, inorder: number[], inStart: number, size: number): TreeNode | null {
  if (size === 0) {
    return null
  }
  const rootVal = preorder[preStart]
  // Linear search for the root in inorder: O(n) per node, O(n^2) overall.
  let mid = inStart
  while (inorder[mid] !== rootVal) {
    mid++
  }
  const leftSize = mid - inStart
  const node = new TreeNode(rootVal)
  node.left = buildRange(preorder, preStart + 1, inorder, inStart, leftSize)
  node.right = buildRange(preorder, preStart + 1 + leftSize, inorder, mid + 1, size - 1 - leftSize)
  return node
}

function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  return buildRange(preorder, 0, inorder, 0, preorder.length)
}
