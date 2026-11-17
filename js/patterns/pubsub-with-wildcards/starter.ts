type Handler = (data: unknown, topic: string) => void

class PubSub {
  subscribe(pattern: string, handler: Handler): () => void {
    // TODO
    return () => {}
  }

  publish(topic: string, data?: unknown): number {
    // TODO
    return 0
  }
}
