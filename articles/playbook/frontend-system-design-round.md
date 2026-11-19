---
title: The Frontend System Design Round
order: 3
summary: Use RADIO — Requirements, Architecture, Data model, Interface, Optimisations — to design a client-side product in 45–60 minutes.
---

Frontend system design asks you to design a product from the browser's point of view: a news feed, an autocomplete, a chat app, a photo gallery, a collaborative editor. Unlike backend design, the focus is component architecture, client state, API contracts, rendering strategy, performance and accessibility. RADIO is a simple framework that keeps you structured and stops you diving into details too early.

## RADIO at a glance

| Step | Question it answers | Typical time (of 45 min) |
|---|---|---|
| **R**equirements | What are we building, for whom, at what scale? | ~5 min |
| **A**rchitecture | What are the major client components and how do they talk? | ~10 min |
| **D**ata model | What state lives where, and what shape does it have? | ~5–8 min |
| **I**nterface (API) | What do the server APIs and component APIs look like? | ~5–8 min |
| **O**ptimisations | Performance, a11y, offline, i18n, security deep dives | ~15–20 min |

Keep a visible agenda. If the interviewer pulls you into a deep dive early, follow, but note what you're skipping.

## Requirements

Split into functional and non-functional, and agree on what's out of scope.

- **Functional:** core user actions. For a news feed: view feed, infinite scroll, like, comment, create post with image.
- **Non-functional:** performance targets, devices (mobile web?), network conditions, accessibility, i18n, SEO needs, offline support.
- **Scale hints:** number of items, update frequency, media heavy or text heavy.
- **Out of scope:** auth, admin tools, backend storage — say so explicitly.

Ask: "Should I focus on the feed experience end to end, or on a particular part like composing posts?"

## Architecture

Draw boxes for the main client-side pieces and arrows for data flow. A typical diagram:

```text
+-----------+      +-------------------+      +------------+
|  Server   | <--> |  API / data layer | <--> |   Store    |
|  (REST /  |      |  fetch, cache,    |      |  (client   |
|  GraphQL) |      |  retries, dedupe  |      |   state)   |
+-----------+      +-------------------+      +------------+
                                                    |
                         +--------------------------+
                         v
         +--------------------------------+
         | View: Feed -> FeedItem -> ...  |
         | Composer, Comments, Toasts     |
         +--------------------------------+
```

Name each box's responsibility in one line. Mention the rendering strategy here:

| Strategy | Use when |
|---|---|
| CSR (client-side render) | App behind login, highly interactive, SEO irrelevant |
| SSR (server-side render) | Fast first paint and SEO on dynamic content |
| SSG / ISR (static) | Content changes rarely; served from CDN |
| Streaming SSR + server components | Large pages where parts can stream as data resolves |

## Data model

Separate **server state** (cached copies of backend data) from **client state** (UI-only: open menus, drafts, selected tab).

```ts
type FeedState = {
  posts: Record<string, Post>          // normalised by id
  feedIds: string[]                     // order as returned by server
  cursor: string | null                 // for the next page
  status: 'idle' | 'loading' | 'error'
}

type Post = { id: string; authorId: string; text: string; media?: Media[]; likeCount: number; likedByMe: boolean; createdAt: string }
```

- Normalise entities shared across views (users, posts) so one update shows everywhere.
- Note which fields are derived versus stored.
- Say where state lives: component state, a store, URL (filters, pagination), or a server cache like TanStack Query.

## Interface (API)

Define both server endpoints and key component props.

```text
GET  /feed?cursor=abc&limit=20   -> { items: Post[], nextCursor: string | null }
POST /posts                       -> Post
POST /posts/:id/like              -> { likeCount, likedByMe }
```

- **Cursor vs offset pagination:** cursors are stable when new items are inserted at the top; offsets skip or duplicate items.
- **REST vs GraphQL:** GraphQL avoids over-fetching and multiple round trips for nested data; REST is simpler to cache at the HTTP layer.
- **Real-time:** polling (simple), long polling, Server-Sent Events (server to client only, auto-reconnect), WebSockets (bidirectional, chat, presence).

Component interface example: `<Feed fetchPage={(cursor) => Promise<Page>} renderItem={(post) => ReactNode} />`.

## Optimisations and deep dives

Pick the two or three most relevant to the product and go deep rather than listing everything.

### Performance

- Code-split by route and lazy-load heavy widgets (composer, emoji picker).
- Virtualise long lists; recycle DOM nodes.
- Lazy-load images (`loading="lazy"`), serve responsive sizes with `srcset`, modern formats (AVIF/WebP), and reserve space to avoid layout shift.
- Prefetch the next page when the user nears the end (`IntersectionObserver` on a sentinel).
- Measure with Core Web Vitals: LCP, INP, CLS.

### Network and data

- Request deduplication and caching; stale-while-revalidate.
- Optimistic updates for likes and comments, with rollback on failure.
- Retries with exponential backoff; cancel stale requests.
- Batch analytics events and send with `navigator.sendBeacon` on page hide.

### Offline and resilience

- Service worker to cache the app shell and recent data.
- Queue writes in IndexedDB and replay when back online.

### Accessibility

- Feed as a list with proper headings; new items announced politely rather than shifting focus.
- Keyboard shortcuts with discoverable help; focus management in modals.
- Respect `prefers-reduced-motion`.

### Security

- Escape user-generated content; sanitise any HTML; strict CSP.
- Tokens in `HttpOnly` cookies; CSRF protection for state-changing requests.

### Internationalisation

- Externalise strings; use `Intl` for dates, numbers and plurals; support RTL with logical CSS properties.

## Common deep-dive topics

| Product | Likely deep dive |
|---|---|
| News feed | Infinite scroll, virtualisation, optimistic likes, new-post banner |
| Autocomplete | Debounce, caching per query, race conditions, ARIA combobox |
| Chat app | WebSockets, message ordering, delivery states, offline queue |
| Photo gallery | Image loading, responsive images, lightbox focus trap |
| Collaborative editor | CRDT vs OT, presence, conflict resolution |
| E-commerce page | SSR/SEO, LCP image, cart state across tabs |
| Video player | Adaptive streaming (HLS/DASH), buffering, captions |
| Dashboard | Polling vs push, chart rendering cost, Web Workers |

## What to draw

- One architecture diagram with 4–7 boxes and labelled arrows.
- The data model as a type definition, not a database schema.
- API endpoints as a short list with request/response shapes.
- Optionally a component tree for the main screen.

Keep diagrams tidy and update them as decisions change; the final whiteboard is often what gets reviewed.

## A worked opening: "Design a photo-sharing feed like an image social app"

The first ten minutes decide the round. A strong opening sounds like this.

**Requirements.** "Let me confirm scope. Users scroll a feed of photo posts with captions, like and comment, and see new posts. Is uploading in scope? (No.) Which devices? (Mobile web first.) Do we need offline? (Nice to have.) How fresh should the feed be? (New posts within a minute is fine.) I'll aim for fast first load on mid-range phones, smooth scrolling, and accessibility."

**Architecture.** The candidate draws boxes and arrows while talking:

```
Server-rendered shell ─▶ Feed page
                            ├─ FeedList (virtualised) ── PostCard ── ImageWithPlaceholder
                            │                                    └── LikeButton / CommentsPreview
                            ├─ NewPostsBanner ◀── polling or SSE
                            └─ FeedStore (normalised posts, users, cursors) ◀▶ API client (cache, retries)
```

"The store is the single source of truth; components read slices of it. The API client handles caching, deduplication and retries, so components never fetch directly."

**Data model.** "Posts and users normalised by id; the feed is an ordered list of post ids plus a `nextCursor`. Likes are optimistic, so each post keeps `likedByMe` and `likeCount`, with a pending flag for rollback."

**Interface.** "`GET /feed?cursor=…&limit=20` returns posts, their authors and the next cursor. `POST /posts/:id/like` is idempotent. A server-sent events stream announces new post ids."

Then the candidate **asks** what to go deeper on, offering options: "I could go deep on scroll performance and image loading, on the real-time update flow, or on offline support. Which is most interesting to you?"

That question matters: it shows prioritisation and lets the interviewer steer to what they score.

## Calibrating depth by level

| Level | What interviewers expect |
| --- | --- |
| Junior / mid | A sensible component breakdown, state ownership, basic API design, awareness of performance and accessibility |
| Senior | Trade-offs with reasons (pagination types, rendering strategies, caching layers), failure modes, measurable performance targets |
| Staff | Cross-team concerns: design system reuse, rollout and experimentation, observability, migration paths, cost |

## Back-of-the-envelope numbers worth knowing

- A mid-range phone parses and compiles JavaScript several times slower than a laptop; 170 KB of compressed JS is a common per-route budget.
- 60 fps leaves about 16 ms per frame; long tasks over 50 ms hurt responsiveness.
- A round trip on a typical mobile network is 100–300 ms; every sequential request on the critical path adds one.
- Good Core Web Vitals: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile.

## Common interview questions

**How is this different from backend system design?**
The focus is the client: component boundaries, state management, rendering strategy, network efficiency, perceived performance and accessibility. You treat the server as an API you can shape, not as databases and shards.

**How do you handle a feed that updates while the user is reading?**
Don't insert items above the viewport; show a "new posts" pill that prepends on click, keeping scroll position stable.

**When would you pick WebSockets over SSE?**
When the client also sends frequent messages (chat, games, collaborative cursors). For server-only push like notifications, SSE is simpler and works over plain HTTP.

**How would you make an optimistic update safe?**
Apply the change locally, keep the previous value, send the request, and roll back with an error toast if it fails. Use the server response as the source of truth when it arrives.

**How do you decide what goes in global state?**
Only data shared across distant components or needing persistence. Server data belongs in a query cache; ephemeral UI state stays local.

## Pitfalls

- Jumping to optimisations before agreeing on requirements.
- Designing the backend database instead of the client.
- Listing every optimisation shallowly instead of going deep on a few.
- Forgetting loading, error and empty states in the data model.
- Ignoring accessibility and mobile constraints entirely.

## Key takeaways

- Use RADIO: requirements, architecture, data model, interface, optimisations.
- Spend the first ten minutes on scope and a clear component and data-flow diagram.
- Name the source of truth for state and keep components free of direct fetching.
- Offer deep-dive options and let the interviewer choose.
- Back trade-offs with numbers: budgets, latencies, Core Web Vitals targets.
