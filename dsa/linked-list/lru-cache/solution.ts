class CacheNode {
  key: number
  value: number
  prev: CacheNode | null
  next: CacheNode | null

  constructor(key: number, value: number) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}

class LRUCache {
  capacity: number
  nodes: Map<number, CacheNode> // key -> its node in the list
  // A doubly linked list ordered by use: head.next is the least recently used,
  // tail.prev the most recently used. head and tail are sentinels.
  head: CacheNode
  tail: CacheNode

  constructor(capacity: number) {
    this.capacity = capacity
    this.nodes = new Map()
    this.head = new CacheNode(0, 0)
    this.tail = new CacheNode(0, 0)
    this.head.next = this.tail
    this.tail.prev = this.head
  }

unlink(node: CacheNode): void {
    const before = node.prev as CacheNode
    const after = node.next as CacheNode
    before.next = after
    after.prev = before
  }

addToEnd(node: CacheNode): void {
    const last = this.tail.prev as CacheNode
    last.next = node
    node.prev = last
    node.next = this.tail
    this.tail.prev = node
  }

  get(key: number): number {
    const node = this.nodes.get(key)
    if (node === undefined) {
      return -1
    }
    // Mark as most recently used.
    this.unlink(node)
    this.addToEnd(node)
    return node.value
  }

  put(key: number, value: number): void {
    const existing = this.nodes.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.unlink(existing)
      this.addToEnd(existing)
      return
    }
    const node = new CacheNode(key, value)
    this.nodes.set(key, node)
    this.addToEnd(node)
    if (this.nodes.size > this.capacity) {
      const oldest = this.head.next as CacheNode
      this.unlink(oldest)
      this.nodes.delete(oldest.key)
    }
  }
}
