---
title: React Performance
order: 4
summary: When memoisation actually helps, virtualising long lists, code splitting with lazy and Suspense, transitions for responsiveness, and profiling before optimising.
---

Performance questions reward a method more than tricks: measure, find what re-renders or what blocks the main thread, fix the cause, measure again. Know the tools well enough to say when each one is useless.

## Where React apps get slow

| Symptom | Usual cause | Fix |
|---|---|---|
| Typing lags | Large subtree re-renders per keystroke | Move state down, `useDeferredValue`, memo the expensive child |
| Long list janks | Thousands of DOM nodes | Virtualise |
| Slow first load | Large JS bundle | Code splitting, lazy routes, SSR/RSC |
| Click freezes UI | Long synchronous render or computation | Transitions, split work, Web Worker, better algorithm |
| Context change slows app | Many consumers re-render | Split context, store with selectors |
| Layout thrash | Measuring then writing in loops | Batch reads/writes, `ResizeObserver` |

## `memo`, `useMemo`, `useCallback`

| API | Memoises | Helps when |
|---|---|---|
| `memo(Component)` | The rendered output, skipped if props are shallow-equal | Component is expensive and often receives the same props from a parent that re-renders |
| `useMemo(fn, deps)` | A computed value | Computation is measurably expensive, or the value's identity matters (prop to a memo child, effect dep) |
| `useCallback(fn, deps)` | A function's identity | Passed to a `memo` child or used as an effect/hook dependency |

They only help **together**: `memo(Child)` is useless if the parent passes a new inline object or arrow function every render.

```tsx
const Row = memo(function Row({ item, onSelect }: RowProps) {
  return <li onClick={() => onSelect(item.id)}>{item.label}</li>
})

function List({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const onSelect = useCallback((id: string) => setSelected(id), [])
  return <ul>{items.map((i) => <Row key={i.id} item={i} onSelect={onSelect} />)}</ul>
}
```

When they don't matter:

- The component is cheap to render (most are). Memoisation has its own cost: comparing props and storing values.
- Props change on every render anyway (`children` JSX is a new object each render, which defeats `memo`).
- Inside code compiled by the **React Compiler**, which inserts equivalent memoisation automatically. In a compiled codebase, add manual memoisation only where profiling shows a gap.

Cheaper alternatives to try first: move state down, lift content up as `children`, split a component so the stateful part is small.

```tsx
// ExpensiveTree doesn't re-render when color changes: it was created by the parent
function ColorPicker({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState('red')
  return <div style={{ color }}><input value={color} onChange={(e) => setColor(e.target.value)} />{children}</div>
}
// <ColorPicker><ExpensiveTree /></ColorPicker>
```

## List virtualisation

Render only the rows in (or near) the viewport and use spacer height to keep the scrollbar honest. Turns 10,000 DOM nodes into ~30.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function BigList({ rows }: { rows: Row[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  })
  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: v.getTotalSize(), position: 'relative' }}>
        {v.getVirtualItems().map((vi) => (
          <div key={rows[vi.index].id} ref={v.measureElement} data-index={vi.index}
               style={{ position: 'absolute', top: 0, width: '100%', transform: `translateY(${vi.start}px)` }}>
            {rows[vi.index].label}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Trade-offs to mention: Ctrl+F can't find off-screen rows; screen readers see only rendered rows (set `aria-setsize`/`aria-posinset` on items); variable heights need measurement; scroll restoration is harder. For moderately long lists, CSS `content-visibility: auto` with `contain-intrinsic-size` is a cheaper middle ground that keeps the DOM intact.

## Code splitting with `lazy` and Suspense

```tsx
const Settings = lazy(() => import('./Settings'))

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

- Split by **route** first, then by heavy, rarely used widgets (editors, charts, maps, modals).
- `lazy` must be called at module top level, not in render (otherwise a new component type each render remounts and refetches).
- Prefetch on intent: call the `import()` on hover/focus of the link so the chunk is ready by click.
- Place Suspense boundaries where a loading state makes sense to users; too high blanks the page, too many causes popcorn loading.
- Wrap navigations in a transition so React keeps showing the old screen instead of falling back to a spinner.

## Transitions: `useTransition` and `useDeferredValue`

Concurrent rendering lets React mark some updates as **non-urgent**. Urgent updates (typing, clicks) interrupt non-urgent renders, keeping input responsive.

```tsx
function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <SlowResults query={deferredQuery} /> {/* wrap in memo so it only re-renders on deferred value */}
      </div>
    </>
  )
}
```

```tsx
const [isPending, startTransition] = useTransition()
function selectTab(next: Tab) {
  startTransition(() => setTab(next)) // old tab stays interactive while new one renders
}
```

| | `useTransition` | `useDeferredValue` |
|---|---|---|
| You control | The state update | A value you receive |
| Gives you | `isPending` + `startTransition` | A lagging copy of the value |
| Use when | You own the setter (tabs, navigation, filters) | Value comes from props or you can't wrap the setter |

Limits: transitions don't make slow code faster; they keep the UI responsive while it runs. Controlled input values must not be updated inside a transition. Work that blocks for seconds still needs a better algorithm, chunking or a Web Worker. Unlike debouncing, there's no fixed delay: on a fast device the deferred render happens almost immediately.

## Profiling

1. **React DevTools Profiler**: record an interaction, inspect flame graph per commit, "why did this render?" and render durations. Enable "Highlight updates" to see re-render cascades.
2. **Chrome DevTools Performance panel**: long tasks, scripting vs layout vs paint, INP attribution for interactions. React 19.2 adds React-specific tracks (Scheduler and Components) to this panel.
3. **Production build**: development builds are several times slower; profile a production build (or the profiling build) for real numbers.
4. **Field data**: `web-vitals` library for INP and LCP from real users.

Throttle CPU (4x/6x) in DevTools to approximate mid-range phones.

## Other techniques worth naming

- Avoid creating components or contexts inside render.
- Stable `key`s so React reuses DOM rather than recreating it.
- Debounce or throttle expensive non-React work (network, analytics).
- Move heavy computation to a Web Worker.
- Use `startTransition` for navigation in routers; frameworks often do this for you.
- Keep bundle lean: check what large dependencies ship (`date-fns` subpaths vs whole `moment`).
- Server Components ship zero JS for non-interactive parts.

## Common interview questions

**When does `useCallback` actually help?**
When the function's identity matters: passed to a `memo` child, or used as a dependency of an effect or another hook. Otherwise it adds overhead for nothing.

**Why might `memo` not prevent a re-render?**
A prop changes identity every render (inline object, array, function, or `children` JSX), or the component consumes a context that changed, or its own state changed.

**How would you render a list of 50,000 items?**
Virtualise: render only visible rows with overscan, absolutely position them inside a container of total height, measure dynamic heights, and handle a11y (`aria-setsize`, `aria-posinset`) and scroll restoration.

**Difference between debouncing and `useDeferredValue`?**
Debouncing delays work by a fixed time even on fast devices. `useDeferredValue` renders the deferred update as soon as possible but interruptibly, so typing stays responsive without an arbitrary delay.

**How does the React Compiler change performance advice?**
It auto-memoises, so manual `memo`/`useMemo`/`useCallback` is rarely needed. Structural advice (state placement, virtualisation, splitting, algorithms) still applies.

**How do you find what's slow?**
Profile a production build with the React Profiler and the Performance panel under CPU throttling; look for long commits, unnecessary renders and long tasks; then fix the biggest one and re-measure.

## Pitfalls

- Memoising everything by default (noise and memory without gain).
- `memo` child receiving `style={{...}}` or `onClick={() => ...}` inline.
- Calling `lazy()` inside a component.
- Profiling the development build and optimising StrictMode double renders.
- Using transitions to hide an O(n²) loop.
