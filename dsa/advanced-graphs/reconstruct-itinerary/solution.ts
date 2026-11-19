function findItinerary(tickets: string[][]): string[] {
  // Destinations per airport, sorted in descending order so that taking the
  // last element (pop) always uses the alphabetically smallest destination.
  const flights = new Map<string, string[]>()
  for (let i = 0; i < tickets.length; i++) {
    let list = flights.get(tickets[i][0])
    if (list === undefined) {
      list = []
      flights.set(tickets[i][0], list)
    }
    list.push(tickets[i][1])
  }
  for (const list of flights.values()) {
    list.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  }

  // Hierholzer's algorithm: walk while tickets remain; an airport with no
  // tickets left belongs at the end of the part of the route still to build.
  const route: string[] = []
  const stack: string[] = ['JFK']
  while (stack.length > 0) {
    const airport = stack[stack.length - 1]
    const next = flights.get(airport)
    if (next !== undefined && next.length > 0) {
      stack.push(next.pop() as string)
    } else {
      route.push(stack.pop() as string)
    }
  }
  // Airports were added from the end of the itinerary backwards.
  const itinerary: string[] = []
  for (let i = route.length - 1; i >= 0; i--) {
    itinerary.push(route[i])
  }
  return itinerary
}
