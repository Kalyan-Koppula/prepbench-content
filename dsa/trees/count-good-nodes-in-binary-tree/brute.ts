function walk(node: TreeNode | null, path: number[], counter: number[]): void {
  if (node === null) {
    return
  }
  // Check the node against every value on its path: O(depth) per node.
  let good = true
  for (let i = 0; i < path.length; i++) {
    if (path[i] > node.val) {
      good = false
      break
    }
  }
  if (good) {
    counter[0]++
  }
  path.push(node.val)
  walk(node.left, path, counter)
  walk(node.right, path, counter)
  path.pop()
}

function goodNodes(root: TreeNode | null): number {
  const counter = [0]
  walk(root, [], counter)
  return counter[0]
}
