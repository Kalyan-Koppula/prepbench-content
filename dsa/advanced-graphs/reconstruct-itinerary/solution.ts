function findItinerary(tickets: string[][]): string[] {
  const flights = new Map<string, string[]>()
  for (const [from, to] of tickets) {
    if (!flights.has(from)) flights.set(from, [])
    flights.get(from)!.push(to)
  }
  // Sort descending so pop() returns the smallest destination.
  for (const list of flights.values()) list.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))

  const route: string[] = []
  const stack = ['JFK']
  while (stack.length) {
    const next = flights.get(stack[stack.length - 1])
    if (next && next.length) stack.push(next.pop()!)
    else route.push(stack.pop()!) // dead end: belongs at the end of what's left
  }
  return route.reverse()
}
