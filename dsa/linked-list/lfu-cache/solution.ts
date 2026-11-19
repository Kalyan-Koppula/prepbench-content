class LfuNode {
  key: number
  value: number
  count: number
  prev: LfuNode | null
  next: LfuNode | null

  constructor(key: number, value: number) {
    this.key = key
    this.value = value
    this.count = 1
    this.prev = null
    this.next = null
  }
}

// Doubly linked list with sentinels; oldest node right after head.
class NodeList {
  head: LfuNode
  tail: LfuNode
  size: number

  constructor() {
    this.head = new LfuNode(0, 0)
    this.tail = new LfuNode(0, 0)
    this.head.next = this.tail
    this.tail.prev = this.head
    this.size = 0
  }

  addToEnd(node: LfuNode): void {
    const last = this.tail.prev as LfuNode
    last.next = node
    node.prev = last
    node.next = this.tail
    this.tail.prev = node
    this.size++
  }

  remove(node: LfuNode): void {
    const before = node.prev as LfuNode
    const after = node.next as LfuNode
    before.next = after
    after.prev = before
    this.size--
  }

  oldest(): LfuNode {
    return this.head.next as LfuNode
  }
}

class LFUCache {
  capacity: number
  nodes: Map<number, LfuNode> // key -> node
  lists: Map<number, NodeList> // use count -> nodes with that count, by recency
  minCount: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.nodes = new Map()
    this.lists = new Map()
    this.minCount = 0
  }

  listFor(count: number): NodeList {
    let list = this.lists.get(count)
    if (list === undefined) {
      list = new NodeList()
      this.lists.set(count, list)
    }
    return list
  }

  // Move a node from its count's list to the next count's list.
  touch(node: LfuNode): void {
    const list = this.listFor(node.count)
    list.remove(node)
    if (list.size === 0 && this.minCount === node.count) {
      this.minCount = node.count + 1
    }
    node.count++
    this.listFor(node.count).addToEnd(node)
  }

  get(key: number): number {
    const node = this.nodes.get(key)
    if (node === undefined) {
      return -1
    }
    this.touch(node)
    return node.value
  }

  put(key: number, value: number): void {
    const existing = this.nodes.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.touch(existing)
      return
    }
    if (this.nodes.size >= this.capacity) {
      // Least frequent, and among those the least recently used.
      const victim = this.listFor(this.minCount).oldest()
      this.listFor(this.minCount).remove(victim)
      this.nodes.delete(victim.key)
    }
    const node = new LfuNode(key, value)
    this.nodes.set(key, node)
    this.listFor(1).addToEnd(node)
    this.minCount = 1 // a brand-new key always has the lowest count
  }
}
