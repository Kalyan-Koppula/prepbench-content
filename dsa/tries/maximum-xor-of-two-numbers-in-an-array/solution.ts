class BitNode {
  zero: BitNode | null
  one: BitNode | null

  constructor() {
    this.zero = null
    this.one = null
  }
}

function findMaximumXOR(nums: number[]): number {
  const BITS = 31 // values fit in bits 30..0
  // Insert every number as a path of bits, highest bit first.
  const root = new BitNode()
  for (let i = 0; i < nums.length; i++) {
    let node = root
    for (let b = BITS - 1; b >= 0; b--) {
      const bit = (nums[i] >> b) & 1
      if (bit === 0) {
        if (node.zero === null) {
          node.zero = new BitNode()
        }
        node = node.zero
      } else {
        if (node.one === null) {
          node.one = new BitNode()
        }
        node = node.one
      }
    }
  }

  let best = 0
  for (let i = 0; i < nums.length; i++) {
    // Greedy from the top bit: prefer the opposite bit, which makes this XOR bit 1.
    let node = root
    let value = 0
    for (let b = BITS - 1; b >= 0; b--) {
      const bit = (nums[i] >> b) & 1
      const opposite = bit === 0 ? node.one : node.zero
      if (opposite !== null) {
        value += Math.pow(2, b)
        node = opposite
      } else {
        node = (bit === 0 ? node.zero : node.one) as BitNode // same bit must exist
      }
    }
    if (value > best) {
      best = value
    }
  }
  return best
}
