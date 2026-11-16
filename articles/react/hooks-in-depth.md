---
title: Hooks in Depth
order: 2
summary: Rules of hooks and why they exist, stale closures, effect dependencies and cleanup, refs vs state, layout effects, custom hooks, and when not to use an effect.
---

Hooks questions test whether you understand that a component is a function called on every render, with each render getting its own props, state and closures. Most hook bugs are a misunderstanding of that one idea.

## Rules of hooks and why

1. **Only call hooks at the top level** — not inside conditions, loops, nested functions or after an early return.
2. **Only call hooks from React functions** — components or custom hooks (names starting with `use`).

Why: React does not identify hooks by name. It stores hook state in a linked list on the component's fiber and matches each call to its slot **by call order**. If the order changes between renders, hook 2 reads hook 3's state.

```tsx
function Bad({ show }: { show: boolean }) {
  if (show) {
    const [a, setA] = useState(0) // slot 0 only sometimes
  }
  const [b, setB] = useState('') // slot 0 or 1 -> corrupted
}
```

Exception: `use(promiseOrContext)` in React 19 may be called conditionally and inside loops, because it does not allocate a persistent slot in the same way. It still must be called during render.

Enforce with `eslint-plugin-react-hooks` (`rules-of-hooks` and `exhaustive-deps`; the newer recommended config also includes compiler-aligned rules).

## Stale closures

Every render creates new functions that close over that render's values. A function created in render 1 and called later still sees render 1's state.

```tsx
function Counter() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1) // always 0 + 1: closes over the first render's count
    }, 1000)
    return () => clearInterval(id)
  }, []) // dependency lies about what the effect uses
}
```

Fixes, in order of preference:

| Fix | When |
|---|---|
| Updater function: `setCount(c => c + 1)` | The new state depends only on the old state. |
| Add the value to deps | The effect genuinely needs to re-sync when it changes. |
| `useReducer` and dispatch an action | Several pieces of state change together; `dispatch` is stable. |
| `useEffectEvent` (stable in React 19.2) | You need the *latest* value inside an effect without re-running the effect on changes. |
| Ref holding the latest value | Pre-19.2 escape hatch; write `ref.current = value` in an effect, read it in callbacks. |

```tsx
const onTick = useEffectEvent(() => {
  log(count, userId) // always latest values
})
useEffect(() => {
  const id = setInterval(onTick, 1000)
  return () => clearInterval(id)
}, []) // effect events are not dependencies
```

## `useEffect`: dependencies and cleanup

Mental model: an effect **synchronises** your component with an external system for the current props/state. It is not a lifecycle method.

- Runs after commit (after paint in most cases).
- Re-runs when any dependency changes by `Object.is`.
- Before re-running, and on unmount, React calls the previous cleanup.

```tsx
useEffect(() => {
  const conn = createConnection(roomId)
  conn.connect()
  return () => conn.disconnect()
}, [roomId])
```

### Dependency pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Effect runs every render | Object/array/function created in render is a dep | Move it inside the effect, hoist it out of the component, or memoise it. |
| Infinite loop | Effect sets state that is also a dep (or produces a new object) | Derive the value in render instead, or guard the update. |
| Stale data | Dep omitted to "run once" | List it honestly; use an effect event for non-reactive reads. |
| Race condition in fetch | Older request resolves after newer one | Abort in cleanup or ignore results with a `cancelled` flag. |

```tsx
useEffect(() => {
  let ignore = false
  fetchUser(id).then((u) => { if (!ignore) setUser(u) })
  return () => { ignore = true }
}, [id])
```

Never suppress `exhaustive-deps` to make an effect run less often; change the code so the dependency isn't needed.

## `useRef` vs state

| | `useState` | `useRef` |
|---|---|---|
| Survives re-renders | Yes | Yes |
| Changing it triggers a render | Yes | No |
| Read during render | Yes | Avoid (except lazy init); value isn't part of the render snapshot |
| Typical use | Anything shown in UI | DOM nodes, timer ids, previous values, latest-callback, mutable instance data |

```tsx
const timer = useRef<number | null>(null)
function start() {
  timer.current = window.setInterval(tick, 1000)
}
function stop() {
  if (timer.current !== null) clearInterval(timer.current)
}
```

React 19 ref callbacks can return a cleanup function, called when the node detaches:

```tsx
<div ref={(node) => {
  const ro = new ResizeObserver(onResize)
  ro.observe(node)
  return () => ro.disconnect()
}} />
```

## `useLayoutEffect`

Runs synchronously after DOM mutations and **before the browser paints**. Use it only when you must measure layout and update before the user sees a frame, e.g. positioning a tooltip based on its measured size.

```tsx
const ref = useRef<HTMLDivElement>(null)
const [height, setHeight] = useState(0)
useLayoutEffect(() => {
  setHeight(ref.current!.getBoundingClientRect().height)
}, [])
```

- It blocks paint, so keep it fast.
- It does nothing on the server (warns in older versions); for SSR, render a sensible default and measure on the client.
- `useInsertionEffect` runs earlier still and is for CSS-in-JS libraries injecting styles.

## Custom hooks

A custom hook is a function starting with `use` that calls other hooks. It shares **logic**, not **state**: every component calling it gets its own independent state.

```tsx
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => matchMedia(query).matches,
    () => false, // server snapshot
  )
}

function useDebouncedValue<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}
```

Good custom hooks: a narrow purpose, a name describing the *what* (`useOnlineStatus`, not `useMountEffect`), stable return values where callers might use them as deps.

## You might not need an effect

Effects are for synchronising with things **outside** React. Most "effect smells" are really one of these:

| Instead of an effect that... | Do this |
|---|---|
| Computes `fullName` from `first` + `last` into state | Compute it during render. |
| Filters a big list into state when inputs change | Compute in render; `useMemo` if measurably expensive. |
| Resets state when a prop changes | Pass a `key` to remount. |
| Adjusts part of state when a prop changes | Store the previous prop and compare during render, or restructure state. |
| Sends a POST because a flag flipped after a click | Do it in the click handler. |
| Notifies the parent via `onChange` after local state changes | Call `onChange` in the same handler that sets state, or lift state up. |
| Chains effects that set state that triggers effects | Compute the next state in one event handler. |
| Fetches data | Use a framework loader, Server Component, `use()` with a cached promise, or a server-state library. |

Rule of thumb: if the code runs *because the user did something*, it belongs in an event handler. If it runs *because the component is on screen*, it may be an effect.

## Common interview questions

**Why can't hooks be called conditionally?**
React matches hook calls to stored state by call order. Conditional calls shift the order between renders and corrupt state.

**What is a stale closure and how do you fix it?**
A callback or effect that captured values from an old render. Use updater functions, correct dependencies, `useEffectEvent`, or a ref holding the latest value.

**`useEffect` vs `useLayoutEffect`?**
Both run after commit. Layout effects run synchronously before paint and block it; use them only for measuring and adjusting layout to avoid flicker.

**When would you use a ref instead of state?**
For values that must persist but should not cause a render when changed: DOM nodes, timer ids, instance variables, the latest callback.

**Do custom hooks share state between components?**
No. Each call has its own state. To share, lift state up, use context, or an external store.

**How do you avoid a race condition when fetching in an effect?**
Abort the request with an `AbortController` in the cleanup or set an `ignore` flag so stale responses are dropped.

**What's wrong with an effect that syncs derived state?**
It causes an extra render with stale values in between and duplicates the source of truth. Derive during render instead.

## Pitfalls

- Empty dependency array to "run once" while reading props or state inside.
- Objects or inline functions as dependencies, causing an effect to fire on every render.
- Async functions passed directly to `useEffect` (it must return a cleanup or nothing); define the async function inside.
- Reading `ref.current` during render and expecting the UI to update when it changes.
- Effects that call `setState` unconditionally with a new object (infinite loop).
