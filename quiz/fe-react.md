---
title: React
order: 26
module: react
summary: Rendering and reconciliation, keys and batching, effects and refs, memoisation and context performance, Suspense and transitions, React 19 Actions and hooks, Server Components and hydration.
---

## What makes a React component re-render?

Three things: its own state changes, its parent re-renders, or a context it reads gets a new value. Props changing is not a separate trigger; the parent rendering is what passes new props. A re-render means calling the function again, not necessarily touching the DOM.

## What is the difference between the render phase and the commit phase?

Rendering calls your components to compute the next UI tree; it must be pure because React may run it more than once, pause it or throw it away. Committing applies the minimal DOM changes, attaches refs, runs layout effects, and then after paint runs passive effects. Only the commit is visible to the user.

## How does reconciliation decide whether to keep or replace a DOM node?

It compares the new tree with the previous one position by position. Same element type at the same position: keep the node and its state, update props. Different type: unmount the whole subtree and mount a fresh one. For lists, keys tell React which child is which instead of relying on position.

## Why is the array index a bad key for a list that can reorder?

React matches children by key, so with index keys state and DOM stay attached to positions, not items. Insert at the top or sort, and an input's typed value, focus or a component's local state end up on the wrong row. Index keys are fine only for static lists that never reorder, insert or delete.

## How can you use `key` to reset a component's state?

Changing an element's key makes React treat it as a different component, so it unmounts the old instance and mounts a new one with fresh state: `<ProfileForm key={userId} />`. That is the idiomatic way to reset a form when the selected entity changes, instead of syncing state in an effect.

## Why does defining a component inside another component cause bugs?

The inner function is recreated on every render of the outer one, so React sees a new component type each time, unmounts the old subtree and mounts a new one. Local state is lost and inputs drop focus on every keystroke. Define components at module level and pass data through props.

## What does automatic batching mean since React 18?

Multiple state updates in the same tick, whether in an event handler, a promise callback or a `setTimeout`, are merged into a single render. Before React 18 only updates inside React event handlers were batched. `flushSync` forces a synchronous render in the rare case you need the DOM updated immediately.

## Why does calling `setCount(count + 1)` three times only add one?

`count` is a constant captured from the current render, so all three calls compute the same next value. Pass an updater instead: `setCount(c => c + 1)` queues functions that each receive the latest pending state, giving +3.

## Why don't you see the new state value right after calling a setter?

Setters schedule a re-render; they don't mutate the variable in the current render, which is a snapshot. The new value appears in the next render. If you need it immediately, compute it into a local variable and use that for both the setter and your logic.

## When does React skip re-rendering after a state update?

When the new value is `Object.is`-equal to the current one, React bails out without rendering children (it may still call the component itself once). This is also why mutating an object and setting the same reference does nothing: always create a new object or array.

## When exactly does `useEffect` run, and when does its cleanup run?

After React commits and usually after the browser paints. Before re-running because a dependency changed, React calls the previous cleanup with the previous render's values, and it calls the cleanup again on unmount. Each render's effect closes over that render's props and state.

## How does React compare the values in an effect's dependency array?

Each item is compared with `Object.is` against the previous render. Objects, arrays and functions created during render are new every time, so they rerun the effect on every render. No array means run after every render; an empty array means run once after mount (twice in StrictMode development).

## What is a stale closure in a hook, and how do you fix it?

A callback that captured state from an old render, such as a `setInterval` set up in an effect with `[]` deps that keeps logging the initial count. Fix it with correct dependencies, an updater function so you don't need to read the state, or a ref holding the latest value. `useEffectEvent` (stable since React 19.2) is designed for exactly this.

## How do you prevent race conditions when fetching inside an effect?

Make the cleanup cancel or ignore the stale request: an `AbortController` aborted in cleanup, or a local `ignore` flag checked before setting state. Otherwise a slow response for an old id can overwrite a fast response for the new one. A data-fetching library or framework loader handles this, plus caching, for you.

## When should you not reach for `useEffect`?

When you are computing values from props or state (derive them during render), reacting to a user action (do it in the event handler), resetting state when a prop changes (use a `key`), or chaining state updates. Effects are for synchronising with something outside React: subscriptions, timers, the DOM, the network.

## When do you need `useLayoutEffect` instead of `useEffect`?

When you must read layout and update before the user sees the frame, such as measuring a trigger to position a tooltip; with `useEffect` the user would see a flicker of the wrong position. It runs synchronously after DOM mutations and blocks paint, so keep it short and use it only for measure-then-adjust.

## When do you use a ref instead of state?

When a value must persist across renders but changing it should not re-render: timer IDs, the previous value, a DOM node, the latest callback. Writing `ref.current` is invisible to React. Don't read or write refs during render (lazy initialisation aside), because the UI won't stay in sync with them.

## When does `useMemo` actually pay off?

When the computation is measurably expensive, or when you need a stable reference: a value passed to a `memo`-wrapped child, or used as an effect or other hook dependency. For cheap calculations, or when the consumer isn't memoised, it just adds comparison overhead and noise.

## Why does wrapping a component in `React.memo` often not stop re-renders?

`memo` does a shallow comparison of props, and the parent usually passes something new every render: an inline object, array or arrow function, or JSX `children`. It also can't stop renders caused by the component's own state or a context it reads. Fix the props' identity or restructure, and measure with the Profiler first.

## How is `useCallback` related to `useMemo`?

`useCallback(fn, deps)` is just `useMemo(() => fn, deps)`: it caches the function identity, not its result. It only helps when that identity matters, i.e. the function goes to a memoised child or into a dependency array; otherwise it changes nothing.

## Why can a context provider make large parts of the tree re-render, and how do you contain it?

Every consumer re-renders when the provider's `value` changes by `Object.is`, and `value={{ user, setUser }}` is a new object on every provider render. Memoise the value, split rarely-changing and frequently-changing data into separate contexts, keep state close to where it's used, or move hot state to an external store with selector subscriptions.

## Why isn't context a state-management solution by itself?

Context is dependency injection: it passes a value down without prop drilling, but it has no selectors, so every consumer re-renders on any change. That's fine for theme, locale or the current user; for frequently updated shared state, pair it with a store (`useSyncExternalStore`, Zustand, Redux) that lets components subscribe to slices.

## What's the difference between a controlled and an uncontrolled input?

Controlled: React state is the source of truth via `value` and `onChange`, so you can validate or transform on each keystroke. Uncontrolled: the DOM keeps the value, you set `defaultValue` and read it via a ref or `FormData` on submit. Controlled gives control; uncontrolled is simpler and pairs naturally with React 19 form actions.

## Why does React warn that an input is changing from uncontrolled to controlled?

The `value` prop started as `undefined` (so React treated it as uncontrolled) and later became a string. Initialise the state to `''` rather than leaving it undefined, and pick one mode for the input's whole lifetime.

## When would you reach for `useReducer` over `useState`?

When several pieces of state change together or the next state depends on the kind of event, such as a form wizard or a fetch state machine. The reducer centralises transitions in one pure, testable function, and `dispatch` is stable, so it can be passed down or used in effects without becoming a dependency problem.

## When do you lift state up, and when is that the wrong move?

Lift state to the closest common parent when siblings need to read or change the same data, keeping a single source of truth. Lifting it higher than necessary means every update re-renders a bigger subtree; colocate state as low as possible and reach for context or a store only when the sharing really spans the tree.

## Why does my component render twice and my effect run twice in development?

`<StrictMode>` deliberately double-invokes component bodies and state initialisers and runs every effect's setup, cleanup, setup on mount, to surface impure renders and missing cleanups. It only happens in development. The fix is a correct cleanup, not disabling StrictMode or adding a "has run" ref.

## Why must React components be pure?

Concurrent rendering can call a component multiple times, pause it, or discard the result without committing. Side effects during render (mutating shared objects, firing requests, writing to refs) then happen the wrong number of times or for UI the user never saw. Side effects belong in event handlers or effects.

## What does `<Suspense>` actually do?

When something below it suspends, it shows its `fallback` until that thing is ready, then reveals the content. Things that suspend are `lazy` components, `use(promise)` and Suspense-enabled data sources; data fetched in `useEffect` does not. The nearest boundary catches, so placement decides how much UI is replaced by a spinner.

## How does `React.lazy` work, and what are its gotchas?

`lazy(() => import('./Chart'))` returns a component that loads its module on first render and suspends until it arrives, so it must sit under a `<Suspense>` boundary. Call `lazy` at module level, not inside a component, or it remounts every render. It expects a default export; map named exports with `.then(m => ({ default: m.Chart }))`.

## What problem does `useTransition` solve?

It marks a state update as non-urgent, so React keeps handling urgent updates like typing and can interrupt the slow render in progress. `isPending` lets you show a subtle indicator while the old UI stays visible instead of a fallback. It doesn't make rendering faster, and the controlled input's own value must stay an urgent update.

## When would you use `useDeferredValue` instead of `useTransition`?

When you don't own the state update, for example a value arriving as a prop. `useDeferredValue(query)` first re-renders with the old value, then renders the new one in the background, so an expensive list driven by it lags behind the input instead of blocking it.

## Why are error boundaries still class components, and what don't they catch?

The API is `static getDerivedStateFromError` and `componentDidCatch`, which have no hook equivalent; most teams use the `react-error-boundary` package. Boundaries catch errors thrown while rendering their children, but not in event handlers, async code outside render, server rendering, or the boundary itself. Use try/catch in handlers.

## When do you need a portal, and how do events behave through one?

When an element must render outside its parent's DOM node to escape `overflow: hidden` or a stacking context: modals, toasts, tooltips. `createPortal(ui, document.body)` moves the DOM, but the element stays in the React tree, so context works and events bubble through React ancestors rather than DOM ancestors.

## What is an Action in React 19?

An async function run inside a transition, either via `startTransition(async () => ...)` or by passing a function to a `<form action>` or `formAction`. React tracks its pending state, surfaces errors to the nearest boundary, supports optimistic updates, and resets uncontrolled form fields after a successful form action.

## What does `useActionState` give you?

`const [state, formAction, isPending] = useActionState(action, initialState)`. Your action receives the previous state and the `FormData` and returns the next state, such as validation errors or a success message. Paired with a Server Function it works as progressive enhancement before JavaScript loads.

## How does `useOptimistic` work?

It returns a temporary value to render while an Action is pending, e.g. a new comment shown immediately as "sending". When the Action finishes, the optimistic value is dropped and the component renders the real state again, so a failure automatically reverts the UI without manual rollback.

## How is the `use` API different from other hooks?

It can be called conditionally and inside loops. `use(promise)` suspends until the promise resolves and throws its rejection to an error boundary; `use(Context)` reads context. The promise must be stable, typically passed from a Server Component or a cache, because one created during a client render is new every time.

## What changed about refs in React 19?

Function components receive `ref` as a normal prop, so `forwardRef` is no longer needed. Ref callbacks can return a cleanup function, called when the element detaches, instead of being called again with `null`. `useRef` now requires an initial argument in the TypeScript types.

## How do Server Components differ from Client Components?

Server Components run only on the server, at build or request time, can be `async` and read databases or secrets directly, and ship no JavaScript; they can't use state, effects or browser APIs. Client Components are the familiar kind: pre-rendered to HTML, then hydrated and interactive. `'use client'` marks a boundary file, and everything it imports becomes client code.

## Can a Client Component render a Server Component?

It can't import one, because importing pulls the module into the client bundle. But a Server Component parent can pass server-rendered content into a Client Component as `children` or another prop, which is how you wrap server content in a client-side provider or modal. Props crossing the boundary must be serialisable.

## What does `'use server'` mean?

It marks async functions as Server Functions that client code can call; the framework turns each call into a POST request. It does not mark Server Components, which need no directive. Treat every Server Function as a public HTTP endpoint: validate inputs and check authorisation inside it.

## What causes a hydration mismatch, and how do you fix it?

The first client render produced different markup from the server HTML: `Date.now()` or `Math.random()`, `typeof window` branches, locale or time-zone formatting, invalid nesting like a `<div>` inside a `<p>`, or browser extensions editing the DOM. Render the same thing on both sides first and switch to client-only values in an effect; use `suppressHydrationWarning` only for unavoidable single text nodes like timestamps.

## Why does `useId` exist?

To generate IDs that are stable across server and client renders, so `htmlFor`/`id` and `aria-describedby` pairs match after hydration without a global counter. It isn't meant for list keys, and calling it in a different order or tree shape on server and client breaks the match.

## Why was `useSyncExternalStore` added?

With concurrent rendering, a store that changes mid-render could let different components show different versions of the same data, called tearing. `useSyncExternalStore(subscribe, getSnapshot)` makes React read a consistent snapshot and re-render synchronously when it changes. State libraries use it under the hood; `getSnapshot` must return a cached value.

## What does the React Compiler change about how you write components?

It memoises components and values automatically at build time, so most hand-written `memo`, `useMemo` and `useCallback` becomes unnecessary for skipping renders. It relies on the Rules of React (pure render, no mutating props or state) and skips components that break them. It doesn't change what triggers a render, and context with a changing value still re-renders all consumers.
