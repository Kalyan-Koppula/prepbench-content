function insert(node: TreeNode | null, val: number): TreeNode {
  if (node === null) {
    return new TreeNode(val)
  }
  if (val < node.val) {
    node.left = insert(node.left, val)
  } else {
    node.right = insert(node.right, val)
  }
  return node
}

function bstFromPreorder(preorder: number[]): TreeNode | null {
  // Insert the values one by one in preorder: O(n * h), O(n^2) for a chain.
  let root: TreeNode | null = null
  for (let i = 0; i < preorder.length; i++) {
    root = insert(root, preorder[i])
  }
  return root
}
