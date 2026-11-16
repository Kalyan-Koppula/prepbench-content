---
title: Rendering and Reconciliation
order: 1
summary: What makes a component render, how React turns renders into DOM updates, and why keys, batching and StrictMode behave the way they do.
---

Almost every React interview probes the render model, because every performance or "why is this stale" question reduces to it. Be able to say precisely what triggers a render, what a render is (and isn't), and how React decides what to change in the DOM.

## What triggers a render

A component renders when:

1. **Initial mount** — `root.render(<App />)` or a parent mounts it.
2. **Its own state changes** — a `useState` setter or `useReducer` dispatch with a value that is not `Object.is`-equal to the current one.
3. **Its parent renders** — by default, children re-render whenever the parent does, *regardless of whether props changed*.
4. **A context it reads changes** — `useContext(Ctx)` / `use(Ctx)` subscribes the component to the nearest provider's `value`.
5. **An external store it subscribes to changes** — via `useSyncExternalStore` (what Redux, Zustand etc. use under the hood).

Props changing is **not** a trigger in itself; props only change because the parent rendered. That is the single most common misconception to correct in an interview.

```tsx
function Parent() {
  const [n, setN] = useState(0)
  // Child re-renders on every click even though it takes no props
  return <><button onClick={() => setN(n + 1)}>{n}</button><Child /></>
}
```

Ways to stop the cascade: `memo(Child)`, moving state down into the component that needs it, or passing the expensive subtree as `children` (elements created by a grandparent keep the same identity when the parent's state changes).

## Render phase vs commit phase

| Phase | What happens | Rules |
|---|---|---|
| **Render** | React calls your component functions and builds a new element tree, then diffs it against the previous fiber tree. | Must be pure: no DOM mutation, subscriptions, network calls or writes to refs that other renders read. Can be paused, restarted or thrown away (concurrent rendering). |
| **Commit** | React applies the minimal set of DOM mutations, sets refs, then runs layout effects synchronously. | Synchronous and uninterruptible. |
| **Passive effects** | `useEffect` callbacks run after the browser has had a chance to paint (usually). | Side effects belong here or in event handlers. |

Key points:

- "Rendering" does not mean "touching the DOM". A render that produces identical output commits nothing.
- Because renders can be discarded, side effects in the component body may run for UI that never appears.
- Order within a commit: DOM mutations, then `ref` attachment, then `useLayoutEffect` (child before parent), then paint, then `useEffect` (child before parent).

## Reconciliation

Diffing two arbitrary trees is O(n³). React uses heuristics to make it O(n):

1. **Different element type at the same position → tear down and rebuild.** `<div>` replaced by `<span>`, or `<A />` by `<B />`, unmounts the old subtree (state lost) and mounts a new one.
2. **Same type → keep the instance and update props.** For host elements React patches changed attributes; for components it re-renders with new props, preserving state.
3. **Lists are matched by `key`**, not position.

State is tied to **position in the tree plus type plus key**, not to the variable or JSX you wrote. This explains a classic bug:

```tsx
// Both branches render <Input /> at the same position: state is shared
{isAdmin ? <Input placeholder="admin" /> : <Input placeholder="user" />}

// Force a fresh instance per mode
{isAdmin ? <Input key="admin" /> : <Input key="user" />}
```

And the inverse: defining a component inside another component creates a new type on every render, so its subtree remounts each time and loses state and focus.

```tsx
function Form() {
  const Field = () => <input /> // new function identity every render -> remount
  return <Field />
}
```

### Keys

| Key choice | Behaviour |
|---|---|
| Stable id from data | Correct: items move, insert and delete without losing state. |
| Array index | Fine for static lists that never reorder or filter. Otherwise state and uncontrolled input values "stick" to the wrong row. |
| `Math.random()` / `crypto.randomUUID()` in render | Every render remounts every item: lost state, lost focus, slow. |

Keys only need to be unique among siblings. They are also a deliberate reset tool: `<Profile key={userId} />` throws away all state when the user changes, which is usually better than an effect that resets state.

## Batching

Since React 18 (`createRoot`), **all** state updates queued in the same tick are batched into one render — in event handlers, timeouts, promises and native listeners alike.

```tsx
function onClick() {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // one render, not two
}

async function onSave() {
  await api.save()
  setSaving(false)
  setSaved(true) // still batched after await in React 18+
}
```

- State setters schedule an update; they do not change the variable in the current closure. `console.log(count)` right after `setCount` shows the old value.
- Use the updater form (`setCount(c => c + 1)`) when the next value depends on the previous one, especially when calling the setter several times.
- `flushSync(() => setX(...))` from `react-dom` forces a synchronous render and commit; use sparingly, e.g. to scroll to an item that must exist in the DOM immediately.

### Bailouts

If you set state to a value that is `Object.is`-equal to the current one, React bails out without re-rendering children (it may still call the component once to confirm). Mutating an object and setting the same reference therefore does nothing visible:

```tsx
items.push(newItem)
setItems(items)          // same reference -> no update
setItems([...items, newItem]) // new reference -> render
```

## StrictMode in development

`<StrictMode>` deliberately surfaces impure code. In development only it:

- **Double-invokes** component bodies, `useState`/`useMemo`/`useReducer` initialisers and updater functions, discarding one result.
- **Mounts, unmounts and remounts** every component once, so each effect runs setup, cleanup, setup. Missing cleanups (duplicate subscriptions, leaked intervals, double fetches without abort) become visible.
- Double-invokes ref callbacks (React 19) to check ref cleanup.
- Warns about deprecated APIs.

None of this happens in production. The correct response to "my effect runs twice" is to write a correct cleanup, not to remove StrictMode or add a `hasRun` ref.

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal }).then(/* ... */)
  return () => controller.abort()
}, [url])
```

## Concurrent rendering in one paragraph

With concurrent features (transitions, `useDeferredValue`, Suspense), React can start rendering an update, yield to the browser for more urgent work (typing, clicks), and resume or abandon it. Urgent updates interrupt non-urgent ones. This is why render must be pure and idempotent: React may call your component several times for one committed result.

## React Compiler and memoisation

The React Compiler (stable since late 2025, a Babel/SWC plugin) analyses components and hooks at build time and inserts fine-grained memoisation automatically — roughly what you would get from wrapping values in `useMemo`, callbacks in `useCallback` and JSX subtrees in `memo`, but more granular.

What it changes:

- Most manual `memo`/`useMemo`/`useCallback` becomes unnecessary for *render-skipping*. Children receiving unchanged props from a compiled parent are skipped.
- It relies on you following the Rules of React (pure render, no mutation of props/state, hooks rules). Code that breaks them is skipped by the compiler (it bails out for that component) rather than miscompiled.
- It does not change *when* renders are triggered by state or context; it reduces the work done per render and the cascade to children.

What still matters:

- `useMemo` as a semantic guarantee for an effect dependency is still occasionally needed with libraries that compare by reference.
- Expensive work still needs good data structures; memoising an O(n²) computation only hides it until inputs change.
- Context with a frequently changing `value` still re-renders every consumer.

## Common interview questions

**Does a component re-render when its props change?**
Only because its parent re-rendered. Props are recomputed during the parent's render; a component re-renders whenever its parent does unless it is memoised and its props are shallow-equal.

**What's the difference between rendering and updating the DOM?**
Rendering is calling component functions to compute the next UI; committing is applying the diff to the DOM. Many renders commit nothing.

**Why shouldn't you use array index as key?**
When items are inserted, removed or reordered, indexes shift, so React reuses the wrong instance and its state (input values, focus, local state) appears on the wrong row.

**How do you reset a component's state when a prop changes?**
Give it a `key` derived from that prop. React treats a different key as a different component and remounts it.

**Why does my effect run twice?**
StrictMode in development mounts, unmounts and remounts to verify cleanup. Fix the cleanup; production runs it once.

**Are state updates synchronous?**
No. Setters enqueue an update; React batches all updates in the same tick into one render. The current closure still sees the old value.

**What does the React Compiler do, and does it make `memo` obsolete?**
It auto-memoises values, callbacks and JSX at build time, so manual memoisation is mostly unnecessary in compiled code. It doesn't fix impure components or bad algorithms, and it bails out on code that breaks the Rules of React.

## Pitfalls

- Declaring components inside other components (remount every render).
- Mutating state and setting the same reference (no render).
- Reading state immediately after setting it and expecting the new value.
- Side effects in the render body (run more than once, run for discarded renders).
- Random keys, or index keys on lists that reorder or filter.
- "Fixing" StrictMode double effects with a ref guard instead of a cleanup.
