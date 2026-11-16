function check(args: any[], output: any, expected: any): boolean | string {
  const [tree, key] = args as [(number | null)[], number]
  if (!Array.isArray(output)) return 'expected a tree'

  // Rebuild the returned tree from its level-order array and read it inorder.
  type Node = { val: number; left: Node | null; right: Node | null }
  const inorder: number[] = []
  if (output.length && output[0] !== null) {
    const root: Node = { val: output[0], left: null, right: null }
    const queue: Node[] = [root]
    let i = 1
    for (let q = 0; q < queue.length && i < output.length; q++) {
      const node = queue[q]
      const l = output[i++]
      if (l !== null && l !== undefined) queue.push((node.left = { val: l, left: null, right: null }))
      if (i >= output.length) break
      const r = output[i++]
      if (r !== null && r !== undefined) queue.push((node.right = { val: r, left: null, right: null }))
    }
    const stack: Node[] = []
    let cur: Node | null = root
    while (cur || stack.length) {
      while (cur) {
        stack.push(cur)
        cur = cur.left
      }
      cur = stack.pop()!
      inorder.push(cur.val)
      cur = cur.right
    }
  }

  for (let i = 1; i < inorder.length; i++) {
    if (!(inorder[i - 1] < inorder[i])) return 'the result is not a valid binary search tree'
  }
  const want = tree.filter((v): v is number => v !== null && v !== key).sort((a, b) => a - b)
  if (want.length !== inorder.length || want.some((v, i) => v !== inorder[i]))
    return 'the result should contain exactly the original values without key'
  return true
}
