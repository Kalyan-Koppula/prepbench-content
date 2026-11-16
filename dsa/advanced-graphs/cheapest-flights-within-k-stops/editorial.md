**Key insight:** a hop limit breaks plain Dijkstra — the cheapest way into a city may use too many stops. Bellman-Ford is built in rounds where round `i` allows paths of up to `i` edges, so `k + 1` rounds is exactly the constraint.

## Approach

1. `price[src] = 0`, all others `Infinity`.
2. Repeat `k + 1` times: copy `price` into `next`; for every flight `[u, v, w]`, if `price[u] + w < next[v]`, set `next[v]`. Then `price = next`.
3. Return `price[dst]`, or `-1` if it's still `Infinity`.

Relaxing from the **snapshot** `price` (not from `next`) is what limits each round to one extra flight.

## Complexity

- Time `O(k · E)`.
- Space `O(n)` — two price arrays.

## Alternatives to mention

- **BFS by levels** over `(city, cost)` with pruning on `best[city]` — same idea, also `O(k · E)`.
- **Dijkstra on states `(city, stops)`:** push `[cost, city, stops]`; skip expansion when `stops > k`. Must not discard a state just because the city was seen cheaper with *more* stops — track best cost per `(city, stops)` or the minimum stops seen per city.

## Pitfalls

- Updating in place lets a single round chain several flights, overshooting the stop limit.
- `k` counts stops, not flights: `k = 0` still allows one direct flight.
