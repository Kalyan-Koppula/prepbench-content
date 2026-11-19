// Record the root-to-node path of every node.
function collectPaths(node: TreeNode | null, path: number[], paths: number[][]): void {
  if (node === null) {
    return
  }
  path.push(node.val)
  paths.push(path.slice())
  collectPaths(node.left, path, paths)
  collectPaths(node.right, path, paths)
  path.pop()
}

function distanceK(root: TreeNode | null, target: number, k: number): number[] {
  // distance(a, b) = depth(a) + depth(b) - 2 * depth(lca), using shared path prefixes.
  const paths: number[][] = []
  collectPaths(root, [], paths)
  let targetPath: number[] = []
  for (let i = 0; i < paths.length; i++) {
    if (paths[i][paths[i].length - 1] === target) {
      targetPath = paths[i]
    }
  }
  const result: number[] = []
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i]
    let common = 0
    while (common < p.length && common < targetPath.length && p[common] === targetPath[common]) {
      common++
    }
    if (p.length + targetPath.length - 2 * common === k) {
      result.push(p[p.length - 1])
    }
  }
  return result
}
