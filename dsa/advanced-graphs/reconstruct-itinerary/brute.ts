function findItinerary(tickets: string[][]): string[] {
  const sorted = tickets.slice().sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
  const used = new Array(sorted.length).fill(false)
  const route = ['JFK']
  // Try destinations in alphabetical order; the first full route found is the smallest.
  const dfs = (): boolean => {
    if (route.length === sorted.length + 1) return true
    const at = route[route.length - 1]
    let tried = ''
    for (let i = 0; i < sorted.length; i++) {
      if (used[i] || sorted[i][0] !== at || sorted[i][1] === tried) continue
      tried = sorted[i][1]
      used[i] = true
      route.push(sorted[i][1])
      if (dfs()) return true
      route.pop()
      used[i] = false
    }
    return false
  }
  dfs()
  return route
}
