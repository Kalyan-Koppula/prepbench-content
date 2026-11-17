type Handler = (data: unknown, topic: string) => void

function matchWords(pattern: string[], topic: string[], i = 0, j = 0): boolean {
  if (i === pattern.length) return j === topic.length
  const word = pattern[i]
  if (word === '#') {
    // Either '#' matches nothing more, or it swallows one more topic word.
    return matchWords(pattern, topic, i + 1, j) || (j < topic.length && matchWords(pattern, topic, i, j + 1))
  }
  if (j === topic.length) return false
  return (word === '*' || word === topic[j]) && matchWords(pattern, topic, i + 1, j + 1)
}

class PubSub {
  private subs: { words: string[]; handler: Handler }[] = []

  subscribe(pattern: string, handler: Handler): () => void {
    const sub = { words: pattern.split('.'), handler }
    this.subs.push(sub)
    return () => {
      this.subs = this.subs.filter((s) => s !== sub)
    }
  }

  publish(topic: string, data?: unknown): number {
    const words = topic.split('.')
    let called = 0
    for (const sub of [...this.subs]) {
      if (!matchWords(sub.words, words)) continue
      called++
      sub.handler(data, topic)
    }
    return called
  }
}
