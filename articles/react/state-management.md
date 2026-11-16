---
title: State Management
order: 3
summary: Local, lifted, context, external stores, server state and URL state — what each is for and how to choose without reaching for a library by reflex.
---

"How would you manage state in this app?" is less about naming a library than showing you can classify state and put each kind in the cheapest place that works. Interviewers listen for: minimal state, single source of truth, and knowing why context isn't a state manager.

## Classify the state first

| Kind | Examples | Best home |
|---|---|---|
| **UI / local** | Open/closed, hover, input draft | `useState` in the component that uses it |
| **Shared UI** | Selected tab shared by siblings, wizard step | Lift to nearest common parent |
| **App-wide, low-frequency** | Theme, locale, current user, feature flags | Context |
| **App-wide, high-frequency or complex client state** | Editor document, canvas, multi-pane selection | External store (Zustand, Redux Toolkit, Jotai, XState) |
| **Server state** | Lists, entities, anything fetched | Server-state cache (TanStack Query, SWR, RTK Query, Apollo) or framework loaders / Server Components |
| **URL state** | Filters, sort, page, selected id, search query | Path and query params |
| **Form state** | Field values, touched, errors | Uncontrolled inputs + `FormData`, form actions, or React Hook Form |
| **Derived** | Filtered list, totals, `isValid` | Not state: compute in render |

Most "we need Redux" apps are really server state plus a little UI state.

## Local and lifted state

Start local. Lift only when two components need the same value, to their **nearest** common parent, and pass value plus setter down.

```tsx
function Filters({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}

function Page() {
  const [query, setQuery] = useState('')
  return <><Filters value={query} onChange={setQuery} /><Results query={query} /></>
}
```

Lifting too high causes every component under that parent to re-render on each change. Push state down again when only one branch needs it, and use the `children` prop to keep expensive siblings out of the re-rendering component.

## Context

Context is **dependency injection**, not a store. It passes a value through the tree without prop drilling; every consumer re-renders when the provider's `value` changes by reference.

```tsx
type Theme = 'light' | 'dark'
const ThemeContext = createContext<Theme>('light')
const SetThemeContext = createContext<(t: Theme) => void>(() => {})

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  return (
    <ThemeContext value={theme}> {/* React 19: context as provider */}
      <SetThemeContext value={setTheme}>
        <Shell />
      </SetThemeContext>
    </ThemeContext>
  )
}
```

Making context perform well:

- **Split contexts** by update frequency, and split state from setters (setters are stable).
- **Memoise the value object** if it combines several values: `useMemo(() => ({ user, logout }), [user, logout])` (the React Compiler does this for you).
- There is no built-in selector: a consumer reading `ctx.a` re-renders when `ctx.b` changes. If you need selectors, you want an external store.
- Context is great for rarely changing values; poor for anything updating on every keystroke across many consumers.

## External stores and `useSyncExternalStore`

An external store lives outside React; components subscribe to slices of it. `useSyncExternalStore` is the primitive that makes this safe under concurrent rendering (no "tearing", where different components show different versions of the store in one render).

```tsx
type Listener = () => void
function createStore<T>(initial: T) {
  let state = initial
  const listeners = new Set<Listener>()
  return {
    get: () => state,
    set: (next: T) => { state = next; listeners.forEach((l) => l()) },
    subscribe: (l: Listener) => { listeners.add(l); return () => listeners.delete(l) },
  }
}

const cart = createStore({ items: [] as string[] })

function useCart<S>(select: (s: { items: string[] }) => S) {
  return useSyncExternalStore(cart.subscribe, () => select(cart.get()))
}

const count = useCart((s) => s.items.length) // re-renders only when count changes
```

The snapshot function must return the same reference when nothing changed, or React loops. Selectors returning new objects need memoisation or shallow comparison (Zustand's `useShallow`, Redux's `createSelector`).

| Library | Model | Notes |
|---|---|---|
| Redux Toolkit | Single store, reducers, actions | Predictable, great devtools, more ceremony; RTK Query for server state |
| Zustand | Hook-based store with selectors | Minimal API, no provider required |
| Jotai / Recoil-style | Atoms composed into derived atoms | Fine-grained subscriptions, good for many independent pieces |
| XState / state machines | Explicit states and transitions | Complex flows: checkout, upload, wizards |
| MobX / signals | Observable, auto-tracked | Mutable style, automatic fine-grained updates |

## Server state

Server state is a **cache of data someone else owns**. It needs: deduplication, caching, background refetch, stale-while-revalidate, retries, pagination, invalidation after mutations, optimistic updates. Hand-rolling this in `useEffect` + global store is the classic mistake.

```tsx
const { data, isPending, error } = useQuery({
  queryKey: ['todos', { status }],
  queryFn: () => fetchTodos(status),
  staleTime: 30_000,
})

const qc = useQueryClient()
const add = useMutation({
  mutationFn: createTodo,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
})
```

In frameworks with Server Components (Next.js App Router and similar), much server state is fetched on the server and passed down as props; mutations go through Server Functions plus revalidation. A client cache is still useful for highly interactive, client-driven views.

## URL as state

If a user would expect the state to survive a reload, a shared link or the back button, it belongs in the URL: search query, filters, sort, pagination, selected tab, open modal for a deep-linkable resource.

```tsx
const [params, setParams] = useSearchParams() // react-router
const sort = params.get('sort') ?? 'newest'
function onSort(next: string) {
  setParams((p) => { p.set('sort', next); return p }, { replace: true })
}
```

- Validate and default params when reading; they are user input.
- Use `replace` for high-frequency changes (typing) to avoid flooding history; `push` for navigational changes.

## Derived state

Store the minimum; compute the rest.

```tsx
// Redundant: two sources of truth that can disagree
const [items, setItems] = useState<Item[]>([])
const [selected, setSelected] = useState<Item | null>(null)

// Better: store the id, derive the object
const [selectedId, setSelectedId] = useState<string | null>(null)
const selected = items.find((i) => i.id === selectedId) ?? null
```

Signs of redundant state: an effect whose only job is to `setX` from other state; two pieces of state that must be updated together; storing a prop in state ("mirroring") and then wondering why it doesn't update.

## How to choose

1. Can it be derived? Then it isn't state.
2. Should it survive reload / be shareable? URL.
3. Is it fetched from a server? Server-state cache or framework data layer.
4. Is it used by one component? Local state.
5. By a few nearby components? Lift it.
6. Read widely, changed rarely? Context.
7. Read widely, changed often, or complex transitions? External store with selectors (or a state machine).

Say this order out loud in interviews; it shows judgement rather than library preference.

## Common interview questions

**Is Context a replacement for Redux?**
No. Context passes a value down; it has no selectors, middleware or devtools, and every consumer re-renders when the value changes. It's ideal for low-frequency values; frequently updated shared state wants an external store.

**What problem does `useSyncExternalStore` solve?**
Safe subscription to a mutable external source under concurrent rendering. It prevents tearing and supports a server snapshot for SSR.

**Why not keep fetched data in Redux/global state?**
You'd re-implement caching, deduplication, staleness, refetching and invalidation. Server-state libraries do this and keep server data separate from client UI state.

**When do you put state in the URL?**
When it should survive refresh, be shareable, or work with back/forward: filters, sort, pagination, tabs, selected entity.

**What is derived state and why avoid storing it?**
Values computable from existing state or props. Storing them creates two sources of truth and usually an extra effect and render to keep them in sync.

**How do you stop a context update re-rendering everything?**
Split the context by concern and update frequency, separate setters from values, memoise the value, keep the provider low in the tree, or move to a store with selectors.

## Pitfalls

- Copying props into state and expecting it to follow prop changes.
- One giant context holding everything.
- New object literal as context `value` on every render.
- Store selectors that return a new array/object each call (endless re-renders or wasted ones).
- Server data duplicated into a client store and drifting out of date.
- Losing filters on reload because they lived in component state instead of the URL.
