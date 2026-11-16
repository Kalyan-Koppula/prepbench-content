const BITS = 31 // values fit in bits 30..0

class BitNode {
  children: (BitNode | null)[] = [null, null]
}

function findMaximumXOR(nums: number[]): number {
  const root = new BitNode()
  for (const x of nums) {
    let node = root
    for (let b = BITS - 1; b >= 0; b--) {
      const bit = (x >> b) & 1
      if (!node.children[bit]) node.children[bit] = new BitNode()
      node = node.children[bit]!
    }
  }

  let best = 0
  for (const x of nums) {
    let node = root
    let value = 0
    for (let b = BITS - 1; b >= 0; b--) {
      const want = ((x >> b) & 1) ^ 1 // the opposite bit sets this XOR bit to 1
      if (node.children[want]) {
        value |= 1 << b
        node = node.children[want]!
      } else {
        node = node.children[want ^ 1]!
      }
    }
    best = Math.max(best, value)
  }
  return best
}
