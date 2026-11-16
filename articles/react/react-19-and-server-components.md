---
title: React 19 and Server Components
order: 5
summary: Actions, useActionState, useOptimistic and use, plus how Server Components, streaming SSR and hydration fit together and what they cost.
---

React 19 shifted the default mental model: async work is expressed as **Actions**, data can be read with `use`, and components can run **only on the server**. Interviewers want you to explain the boundaries (what runs where, what crosses the wire) and the trade-offs, not just list APIs.

## Actions

An Action is an async function run inside a transition. React tracks its pending state, error and optimistic updates for you. You get them by:

- Passing a function to `startTransition` (async functions allowed since React 19).
- Passing a function to `<form action={fn}>` or `<button formAction={fn}>`.
- Using `useActionState`.

```tsx
function UpdateName() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      const err = await updateName(name)
      if (err) { setError(err); return }
      redirect('/profile')
    })
  }
  return <button onClick={submit} disabled={isPending}>Save</button>
}
```

Form actions receive `FormData`; React resets uncontrolled form fields after a successful action and progressively enhances when the action is a Server Function (the form works before JS loads).

## `useActionState`

Wraps an action, keeps its latest result as state, and exposes pending status.

```tsx
// actions.ts
'use server'
export async function addToCart(prev: { message: string }, formData: FormData) {
  const id = formData.get('id') as string
  const ok = await db.cart.add(id)
  return { message: ok ? 'Added' : 'Out of stock' }
}

// AddButton.tsx
'use client'
export function AddButton({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(addToCart, { message: '' })
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button disabled={isPending}>Add to cart</button>
      <p aria-live="polite">{state.message}</p>
    </form>
  )
}
```

Signature: `useActionState(action, initialState, permalink?)` returning `[state, dispatch, isPending]`. The action receives the **previous state** as its first argument. Calls are queued sequentially.

`useFormStatus()` (from `react-dom`) lets a child of a `<form>`, such as a submit button component, read `pending`, `data`, `method` and `action` of the parent form without prop drilling.

## `useOptimistic`

Show the expected result immediately while an action is in flight; React reverts to the real state when the transition settles.

```tsx
function Likes({ count, like }: { count: number; like: () => Promise<void> }) {
  const [optimistic, addOptimistic] = useOptimistic(count, (current, delta: number) => current + delta)
  return (
    <button onClick={() => startTransition(async () => {
      addOptimistic(1)
      await like() // parent refetches/revalidates -> new `count` prop
    })}>
      {optimistic} likes
    </button>
  )
}
```

- The optimistic setter must be called inside a transition or action.
- If the action throws, the optimistic value disappears when the transition ends; show an error via an error boundary or state.

## `use`

`use(resource)` reads a **promise** or a **context** during render.

```tsx
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise) // suspends until resolved
  return comments.map((c) => <p key={c.id}>{c.text}</p>)
}
```

- Suspends the component until the promise resolves (nearest `<Suspense>` shows fallback); rejection goes to the nearest error boundary.
- Can be called conditionally and in loops, unlike other hooks.
- The promise must be **stable**: created in a Server Component, a loader, or a cache. Creating a new promise in a Client Component's render causes an infinite suspend loop (React warns about uncached promises).
- `use(Context)` is a conditional-friendly alternative to `useContext`.

## Other React 19 changes worth knowing

| Change | Note |
|---|---|
| `ref` as a regular prop | `forwardRef` no longer needed for function components |
| `<Context value>` as provider | `<Context.Provider>` still works, will be deprecated |
| Ref callback cleanup | Return a function from a ref callback |
| Document metadata | `<title>`, `<meta>`, `<link>` rendered anywhere are hoisted into `<head>` |
| Stylesheets and scripts | `<link rel="stylesheet" precedence>` and async scripts are deduplicated and ordered; Suspense waits for them |
| Resource preloading | `preload`, `preinit`, `prefetchDNS`, `preconnect` from `react-dom` |
| Hydration errors | One diff-style error instead of many; tolerates third-party extensions in `<head>`/`<body>` |
| Removed | `propTypes` and `defaultProps` on function components, string refs, legacy context, `ReactDOM.render` |
| 19.2 additions | `<Activity>` (hide UI while preserving state), `useEffectEvent`, Partial Pre-rendering primitives |

## Server Components vs Client Components

| | Server Component (default in RSC frameworks) | Client Component (`'use client'`) |
|---|---|---|
| Runs | On the server (at request or build time) | On the server for SSR **and** in the browser |
| Ships JS to the client | No | Yes |
| Can be `async` and `await` data | Yes | No (use `use()` or a library) |
| Access to DB, filesystem, secrets | Yes | No |
| State, effects, event handlers, browser APIs | No | Yes |
| Can import the other kind | Can render Client Components | Cannot import Server Components, but can receive them as `children`/props |

```tsx
// app/product/[id]/page.tsx — Server Component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.product.find(id) // runs on server only
  return (
    <>
      <h1>{product.name}</h1>
      <AddToCart id={product.id} />   {/* client island */}
    </>
  )
}

// AddToCart.tsx
'use client'
export function AddToCart({ id }: { id: string }) {
  const [qty, setQty] = useState(1)
  /* ... */
}
```

Key rules:

- `'use client'` marks a **boundary**: that module and everything it imports become client code.
- Props crossing the boundary must be **serialisable**: plain data, Dates, Maps/Sets, promises, JSX, and Server Functions. Not arbitrary functions or class instances.
- `'use server'` marks **Server Functions** (formerly Server Actions): callable from the client via a generated endpoint. Treat each one as a public API: authenticate, authorise and validate inputs.
- Use `server-only` / `client-only` packages to make accidental imports a build error.

### What goes over the wire

Server Components render to the **RSC payload**, a serialised tree of host elements plus references to client component modules and their props. The client runtime merges it into the existing tree, which lets the server re-render a route and update the UI **without losing client state**.

## Streaming SSR and hydration

1. **SSR** renders the full tree (Server and Client Components) to HTML for a fast first paint and SEO.
2. **Streaming**: with `<Suspense>` boundaries, the server flushes the shell immediately and streams each boundary's HTML as its data resolves, with inline scripts that swap it into place. TTFB and FCP no longer wait for the slowest query.
3. **Hydration**: the client loads JS for Client Components and attaches event handlers to the existing HTML (`hydrateRoot`).
4. **Selective hydration**: each Suspense boundary hydrates independently; React prioritises the one the user interacts with.

```tsx
export default function Page() {
  return (
    <Layout>
      <ProductInfo />                       {/* fast, in the shell */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />                          {/* streamed when ready */}
      </Suspense>
    </Layout>
  )
}
```

Hydration mismatches happen when the server and client render different output: `Date.now()`, `Math.random()`, `typeof window` branches, locale formatting, invalid HTML nesting (`<div>` in `<p>`). Fix by rendering deterministic output and moving client-only values into an effect or `useSyncExternalStore` with a server snapshot. `suppressHydrationWarning` is for single unavoidable text differences like timestamps.

## Trade-offs

Benefits:

- Less client JavaScript; data fetching next to the component without waterfalls between client and server.
- Secrets and heavy dependencies (markdown parsers, syntax highlighters) stay on the server.
- Streaming improves perceived performance; progressive enhancement for forms.

Costs:

- Needs a framework and bundler integration (Next.js App Router, React Router RSC mode, Waku, Parcel); can't drop into a plain SPA.
- Mental overhead of two environments and a serialisation boundary; easy to leak server code or secrets into client bundles.
- Every navigation may hit the server; caching and revalidation semantics become central (and framework-specific).
- Server Functions are endpoints that are easy to forget to secure.
- Highly interactive apps (editors, dashboards) mostly end up as Client Components, so gains are smaller.

## Common interview questions

**What's the difference between SSR and Server Components?**
SSR renders components to HTML on the server for the first load, and all of them still hydrate on the client. Server Components never run on the client and ship no JS; they can be used with or without SSR.

**Can a Client Component render a Server Component?**
It can't import one, but it can receive one as `children` or another prop from a Server Component parent, because the server renders it first.

**What does `useOptimistic` give you over setting state manually?**
Automatic rollback: the optimistic value only exists while the action is pending, and the UI converges on the real state when the action finishes or fails.

**Why must the promise passed to `use` be stable?**
Each render would create a new pending promise, suspend again, and loop forever. Create it on the server, in a loader, or cache it.

**How do you avoid hydration mismatches?**
Make server and client render the same output: avoid time/random/browser checks during render, use valid HTML, and defer client-only values to after hydration.

**Are Server Functions secure by default?**
No. They are reachable over HTTP by anyone. Validate input, check auth and authorisation inside each one.

## Pitfalls

- Marking a top-level layout `'use client'` and turning the whole app into client code.
- Passing a non-serialisable prop (function, class instance) from a Server to a Client Component.
- Fetching sequentially in nested Server Components (server-side waterfall); start promises early and pass them down.
- Creating promises in Client Component render for `use`.
- Trusting form data in a Server Function.
