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

## End to end: a comment form with a Server Function

Putting the pieces together. The server side:

```tsx
// actions.ts
'use server'

import { z } from 'zod'

const CommentInput = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
})

export async function addComment(prevState: { error?: string }, formData: FormData) {
  const session = await getSession() // 1. authenticate: this is a public endpoint
  if (!session) return { error: 'Please sign in' }

  const parsed = CommentInput.safeParse({
    postId: formData.get('postId'),
    body: formData.get('body'),
  }) // 2. validate: never trust FormData
  if (!parsed.success) return { error: 'Comment must be 1–2000 characters' }

  const allowed = await canComment(session.userId, parsed.data.postId) // 3. authorise
  if (!allowed) return { error: 'Not allowed' }

  await db.comment.create({ data: { ...parsed.data, authorId: session.userId } })
  revalidatePath(`/posts/${parsed.data.postId}`) // 4. refresh cached server output
  return {}
}
```

The client side:

```tsx
'use client'

import { useActionState, useOptimistic } from 'react'
import { addComment } from './actions'

export function CommentForm({ postId, comments }: { postId: string; comments: Comment[] }) {
  const [state, formAction, isPending] = useActionState(addComment, {})
  const [optimistic, addOptimistic] = useOptimistic(comments, (list, body: string) => [
    ...list,
    { id: 'pending', body, pending: true },
  ])

  return (
    <>
      <ul>
        {optimistic.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>
            {c.body}
          </li>
        ))}
      </ul>
      <form
        action={(formData) => {
          addOptimistic(String(formData.get('body')))
          return formAction(formData)
        }}
      >
        <input type="hidden" name="postId" value={postId} />
        <textarea name="body" required maxLength={2000} />
        <button disabled={isPending}>{isPending ? 'Posting…' : 'Post'}</button>
        {state.error && <p role="alert">{state.error}</p>}
      </form>
    </>
  )
}
```

What happens on submit:

| Step | Where | What |
| --- | --- | --- |
| 1 | Client | The optimistic comment appears at half opacity; the button shows "Posting…" |
| 2 | Network | React posts the form data to the server function's endpoint |
| 3 | Server | Authenticate, validate, authorise, write, revalidate the post page |
| 4 | Client | The new server output streams in with the real comment; the optimistic copy is replaced |
| 5 | Client | On an error, the optimistic entry disappears and `state.error` is shown |

Before JavaScript has loaded, the same form still submits as a normal HTML form post: progressive enhancement for free.

## Securing Server Functions

`'use server'` turns a function into an HTTP endpoint that anyone can call with any arguments, not only your form. Treat each one like an API route:

- **Authenticate and authorise inside the function**, every time. Hiding the button doesn't protect the endpoint.
- **Validate every argument** with a schema; `FormData` values are untrusted strings.
- **Don't return more than needed**; return values are serialised to the client.
- **Mark server-only modules** with `import 'server-only'` so importing them into a Client Component fails the build.
- **Pass secrets through the server environment**, never as props to Client Components, where they become part of the payload.
- Rely on the framework's CSRF protection (Server Functions only accept POST and check the origin), but understand it exists.

## Caching and revalidation

Server Components shift the question from "when do I fetch?" to "how long is this output valid?". Frameworks differ in the details, but the concepts are shared:

| Concept | Meaning |
| --- | --- |
| Static rendering | Output generated at build time or on first request, then reused |
| Dynamic rendering | Output generated per request (uses cookies, headers or uncached data) |
| Time-based revalidation | Regenerate cached output after N seconds |
| On-demand revalidation | Invalidate by path or tag after a mutation (`revalidatePath`, `revalidateTag`) |
| Request deduplication | The same fetch in several components during one render runs once |

A good default: static or cached for content that is the same for everyone, dynamic for anything personal, and on-demand revalidation after every mutation that changes cached output.

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

## Key takeaways

- Actions are async transitions: React tracks pending state, errors and optimistic updates for them.
- `useActionState` keeps an action's latest result; `useOptimistic` shows the expected result until the real one arrives.
- Server Components render on the server and send a serialised tree; Client Components are marked with `'use client'` and hydrate.
- Server Functions are public endpoints: authenticate, authorise and validate inside each one.
- Streaming with Suspense shows content as it becomes ready; caching and revalidation decide how fresh it is.
