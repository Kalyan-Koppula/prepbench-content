---
title: Autocomplete / Typeahead
order: 1
summary: Design a reusable search-as-you-type component — debouncing, caching, race conditions, combobox accessibility and match highlighting.
---

The most common frontend design prompt: small enough to cover end to end in 45 minutes, deep enough to probe networking, caching, concurrency and accessibility. Treat it as a **reusable component** (used in a site search bar, a user picker, an address field) unless told otherwise.

## Requirements

### Clarifying questions

- What are we searching: products, people, places? Is the data on the server or a small local list?
- Results format: plain text, or rich rows (avatar, category, thumbnail)? Grouped sections?
- Is it a free-text search box (Enter submits whatever was typed) or a picker (must choose an option)?
- Single or multi-select (tokens/chips)?
- Expected traffic and result-set size? Is there a minimum query length?
- Mobile support? Offline? Recent searches when empty?

### Functional

- Show suggestions as the user types, after a minimum length (e.g. 1–2 characters).
- Navigate suggestions with mouse, touch and keyboard; select one to fill the input or navigate.
- Highlight the matched part of each suggestion.
- Show loading, empty and error states.
- Optional: recent searches on focus, grouped results, custom row rendering.

### Non-functional

- Fast perceived response: suggestions within ~100–300 ms of pausing.
- Never show results for an outdated query.
- Low network and server load (debounce, cache, dedupe).
- Fully accessible (WAI-ARIA combobox pattern).
- Works on slow networks and mobile; customisable look.

## Architecture

```text
+---------------------------------------------------------------+
| Autocomplete (controller)                                     |
|                                                               |
|  +-------------+   query    +-----------------------------+   |
|  | Input       | ---------> | Query pipeline              |   |
|  | (combobox)  |            | debounce -> cache lookup -> |   |
|  +-------------+            | fetch (abort prev) -> store |   |
|        ^                    +--------------+--------------+   |
|        | activeIndex,                      |                  |
|        | selection                         v                  |
|  +-------------+   results  +-----------------------------+   |
|  | Results     | <--------- | State: query, results,      |   |
|  | (listbox)   |            | status, activeIndex, open   |   |
|  +-------------+            +--------------+--------------+   |
|                                            |                  |
+--------------------------------------------|------------------+
                                             v
                        +------------------------------------+
                        | Cache (query -> results, LRU, TTL) |
                        +------------------------------------+
                                             |
                                             v
                                   GET /search/suggest
```

- **Input**: owns text, keyboard handling, ARIA wiring.
- **Results list**: renders options and the highlight; supports custom row renderers.
- **Controller / state**: one place for query, results, status, open state and active index.
- **Query pipeline**: debounce, cache, request cancellation.
- **Cache**: in-memory map keyed by normalised query.

## Data model

```ts
type Suggestion = {
  id: string
  label: string
  type?: 'product' | 'category' | 'user'
  meta?: { thumbnailUrl?: string; subtitle?: string }
  matches?: Array<[start: number, end: number]> // server-provided highlight ranges
}

type AutocompleteState = {
  query: string
  status: 'idle' | 'loading' | 'success' | 'error'
  results: Suggestion[]
  activeIndex: number // -1 when none
  isOpen: boolean
}

type Cache = Map<string, { results: Suggestion[]; fetchedAt: number }>
```

Normalise cache keys: trim, lowercase, collapse whitespace (and strip diacritics if the server does).

## Interface

### Component API

```ts
type AutocompleteProps = {
  fetchSuggestions: (q: string, signal: AbortSignal) => Promise<Suggestion[]>
  onSelect: (s: Suggestion) => void
  minQueryLength?: number // default 1
  debounceMs?: number // default 200
  renderItem?: (s: Suggestion, state: { active: boolean }) => React.ReactNode
  label: string // accessible name, required
  placeholder?: string
}
```

### Server API

```text
GET /api/suggest?q=red%20sh&limit=8&locale=en-GB
200 {
  "query": "red sh",
  "results": [{ "id": "p_1", "label": "Red shoes", "type": "product", "matches": [[0, 6]] }]
}
```

- Small `limit` (5–10): it's a suggestion list, not a results page; no pagination needed.
- Return the `query` echoed back so the client can verify it matches the latest input.
- `Cache-Control: public, max-age=60` for popular prefixes lets a CDN absorb load.
- Transport: plain HTTP GET (cacheable). WebSockets are unnecessary.

## Optimisations

### Debounce vs throttle

Debounce waits until the user pauses typing (e.g. 150–300 ms) before fetching. Throttle would fire at a fixed rate while typing, which suits live-updating views but wastes requests here.

```ts
function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
```

### Race conditions

Responses can arrive out of order: the reply for `"re"` may land after `"red"`. Defences (use more than one):

1. **Abort** the previous request with `AbortController` when a new one starts.
2. **Ignore stale responses**: compare the response's query (or a request counter) with the latest query before committing.

```ts
let controller: AbortController | null = null
async function search(q: string) {
  controller?.abort()
  controller = new AbortController()
  const { signal } = controller
  const cached = cache.get(q)
  if (cached) return render(q, cached.results)
  try {
    const results = await fetchSuggestions(q, signal)
    cache.set(q, { results, fetchedAt: Date.now() })
    if (q === latestQuery) render(q, results)
  } catch (e) {
    if ((e as Error).name !== 'AbortError') showError()
  }
}
```

### Caching

- Cache by normalised query with a TTL (minutes for products, longer for static data) and an LRU size cap.
- Serve from cache instantly; optionally revalidate in the background.
- **Prefix filtering**: if the full result set for `"red"` was returned (fewer than `limit`), `"red s"` can be filtered client-side without a request.
- For small static datasets (countries, < few thousand items), ship the data once and search locally; consider a trie or a prebuilt index.

### Highlighting

Prefer server-provided match ranges (they know about stemming and diacritics). Client fallback: case-insensitive match, rendered as text nodes, never via `innerHTML`.

```tsx
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase())
  if (!query || i === -1) return <>{text}</>
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</>
}
```

### Accessibility (combobox pattern)

```html
<label for="search">Search products</label>
<input id="search" role="combobox" aria-expanded="true" aria-controls="search-list"
       aria-autocomplete="list" aria-activedescendant="opt-2">
<ul id="search-list" role="listbox" aria-label="Suggestions">
  <li id="opt-1" role="option" aria-selected="false">Red shoes</li>
  <li id="opt-2" role="option" aria-selected="true">Red shirt</li>
</ul>
<div role="status" aria-live="polite" class="sr-only">8 suggestions available</div>
```

- Focus stays in the input; `aria-activedescendant` points at the active option.
- Keys: Down/Up move the active option, Enter selects, Escape closes (second Escape clears), Tab accepts or leaves.
- Announce result counts politely, debounced so screen readers aren't flooded.
- Use `onMouseDown` + `preventDefault` on options so clicking doesn't blur the input before selection.

### Performance and UX

- Keep previous results visible (dimmed) while loading the next query to avoid flicker.
- Virtualise only if showing many rows; usually 5–10 rows suffice.
- Memoise rows; render images with fixed dimensions and lazy load thumbnails.
- On mobile: `inputmode="search"`, `enterkeyhint="search"`, results sized for touch, avoid the virtual keyboard covering the list.

### Other

- **i18n**: IME composition (don't search mid-composition; listen for `compositionend`), RTL layout, locale-aware case folding.
- **Security**: escape result text (XSS), rate-limit on the server, don't leak private data in suggestions.
- **Offline**: show cached and recent searches; disable network fetching gracefully.
- **Analytics**: log selected suggestion and position to improve ranking.

## Running the interview

A 45-minute plan for this question:

| Minutes | Focus |
| --- | --- |
| 0–5 | Requirements: data source and size, result types, latency target, mobile, accessibility |
| 5–12 | Architecture: input, controller, cache, results list, server API |
| 12–20 | Data model and component API |
| 20–35 | Deep dives: request lifecycle (debounce, abort, cache), combobox keyboard and ARIA, highlighting |
| 35–45 | Performance, failure modes, follow-ups |

## Core implementation sketch

The request controller is where most of the interview's correctness lives:

```ts
type Result = { id: string; label: string }

function createSuggestionSource(fetchFn: (q: string, signal: AbortSignal) => Promise<Result[]>) {
  const cache = new Map<string, Result[]>() // query -> results (bound it with LRU in production)
  let controller: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  return function suggest(query: string, onResults: (r: Result[]) => void, delay = 200) {
    clearTimeout(timer)
    const q = query.trim().toLowerCase()
    if (q.length < 2) return onResults([])
    const cached = cache.get(q)
    if (cached) return onResults(cached) // instant for repeated and back-spaced queries

    timer = setTimeout(async () => {
      controller?.abort() // a newer query cancels the older request
      controller = new AbortController()
      try {
        const results = await fetchFn(q, controller.signal)
        cache.set(q, results)
        onResults(results)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') onResults([]) // show an error state in a real UI
      }
    }, delay)
  }
}
```

Points to narrate: debounce limits requests, abort guarantees only the latest response renders, the cache makes backspacing instant, and the minimum length avoids useless one-letter queries. A further optimisation: if "rea" returned fewer results than the page size, "reac" can be filtered locally from it without a request.

## Trade-offs to state explicitly

| Decision | Option A | Option B | Choose by |
| --- | --- | --- | --- |
| Where to search | Server per keystroke | Ship a client index | Dataset size and change rate (a few thousand items can live on the client) |
| Request pacing | Debounce | Throttle | Debounce for search requests; throttle when intermediate results matter |
| Stale responses | Abort | Sequence ids | Abort when the transport supports it; ids otherwise |
| Cache | Memory per session | Persistent (IndexedDB) | Whether suggestions are personal and how fresh they must be |

## Deep-dive questions

**Why debounce rather than throttle?**
Intermediate prefixes are wasted work; debounce sends one request when the user pauses. Throttle suits continuous feedback like scroll position.

**How do you handle out-of-order responses?**
Abort the previous request and also verify the response belongs to the latest query before rendering. Abort alone isn't enough if the response is already being processed.

**What would you cache, and how do you invalidate it?**
Query to results, normalised keys, LRU-capped with a TTL. Invalidate on TTL expiry or when data changes (e.g. after the user creates a new item).

**Why `aria-activedescendant` instead of moving focus to options?**
The user keeps typing in the input; moving DOM focus would break text entry. `aria-activedescendant` tells AT which option is active while focus stays put.

**How would you scale to millions of users?**
CDN caching for popular prefixes, small payloads, minimum query length, debounce, client cache, and a dedicated search service (prefix index, e.g. Elasticsearch or a trie) behind the API.

**How do you show recent searches?**
Store them locally (bounded list in `localStorage`), show on focus with empty input in a separate labelled group, allow removing entries.

## Key takeaways

- Clarify the data size and latency target first; they decide client versus server search.
- Debounce, abort and cache together make the request lifecycle correct and fast.
- Implement the ARIA combobox pattern with `aria-activedescendant`; keep focus in the input.
- Highlight matches safely with text nodes, never HTML strings.
- Handle empty, loading, error and offline states explicitly.
