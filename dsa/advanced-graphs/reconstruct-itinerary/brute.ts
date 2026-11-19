function findItinerary(tickets: string[][]): string[] {
  // Backtracking: try destinations in alphabetical order, each ticket once.
  // The first complete route found is the smallest. Exponential in the worst case.
  const order: number[] = []
  for (let i = 0; i < tickets.length; i++) {
    order.push(i)
  }
  order.sort((a, b) => (tickets[a][1] < tickets[b][1] ? -1 : tickets[a][1] > tickets[b][1] ? 1 : 0))
  const used = new Array(tickets.length).fill(false)
  const route: string[] = ['JFK']

  function explore(): boolean {
    if (route.length === tickets.length + 1) {
      return true
    }
    const here = route[route.length - 1]
    let previous = ''
    for (let k = 0; k < order.length; k++) {
      const t = order[k]
      if (used[t] || tickets[t][0] !== here || tickets[t][1] === previous) {
        continue // skip identical duplicate tickets at this step
      }
      previous = tickets[t][1]
      used[t] = true
      route.push(tickets[t][1])
      if (explore()) {
        return true
      }
      route.pop()
      used[t] = false
    }
    return false
  }

  explore()
  return route
}
