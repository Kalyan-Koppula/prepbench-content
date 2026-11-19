---
title: News Feed
order: 2
summary: Design an infinite-scrolling social feed — cursor pagination, virtualisation, optimistic interactions, new-post notifications and efficient media loading.
---

The feed is the canonical "large dynamic list" problem (Facebook, X, LinkedIn). Interviewers look for: correct pagination for changing data, keeping the DOM small, fast interactions with optimistic updates, and media that doesn't wreck LCP or memory.

## Requirements

### Clarifying questions

- What post types: text, images, video, links with previews, polls?
- Interactions in scope: like, comment, share? Composer for new posts?
- Ranked (algorithmic) or reverse-chronological?
- How should new posts appear: automatically, or behind a "New posts" pill?
- Platforms: desktop web, mobile web? Is SEO needed (usually not for a logged-in feed)?
- Expected session length and scroll depth (affects memory strategy)?

### Functional

- Show a feed of posts, loading more as the user scrolls.
- Like/unlike, comment count, share.
- Create a post (text + images) and see it at the top.
- Notify about new posts without disrupting the reading position.

### Non-functional

- Fast initial load (good LCP) and smooth scrolling (60 fps, good INP).
- Bounded memory over long sessions.
- Resilient to flaky networks; interactions feel instant.
- Accessible to keyboard and screen reader users.

## Architecture

```text
+---------------------------------------------------------------+
| FeedPage                                                      |
|  +-------------+   +---------------------------------------+  |
|  | Composer    |   | NewPostsPill  (shows when buffer > 0) |  |
|  +-------------+   +---------------------------------------+  |
|  +---------------------------------------------------------+  |
|  | VirtualFeedList                                         |  |
|  |   PostCard -> Header | Body | MediaGrid | ActionBar     |  |
|  |   ...                                                   |  |
|  |   Sentinel (IntersectionObserver) -> fetchNextPage      |  |
|  +---------------------------------------------------------+  |
+------------------------------+--------------------------------+
                               |
              +----------------v-----------------+
              | Feed store / server-state cache  |
              | pages, entities, pending buffer  |
              +----------------+-----------------+
                               |
           +-------------------+--------------------+
           v                                        v
   GET /feed?cursor=...                 SSE /feed/stream (new post ids)
   POST /posts, POST /posts/:id/like
```

- **Server-state cache** (TanStack Query `useInfiniteQuery` or a normalised store) owns pages and entities.
- **Virtualised list** renders only visible posts.
- **Sentinel** element near the bottom triggers the next page.
- **Real-time channel** delivers lightweight "new posts available" events.

## Data model

```ts
type User = { id: string; name: string; avatarUrl: string }

type Post = {
  id: string
  authorId: string
  createdAt: string
  text: string
  media: Array<{ type: 'image' | 'video'; url: string; width: number; height: number; blurhash?: string }>
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

type FeedState = {
  postIds: string[]              // order for rendering
  posts: Record<string, Post>    // normalised entities
  users: Record<string, User>
  nextCursor: string | null
  status: 'idle' | 'loading' | 'error'
  pendingNewPostIds: string[]    // arrived via real-time, not yet shown
}
```

Normalising means a user's updated avatar or a post liked in a detail view updates everywhere it appears.

## Interface

```text
GET /api/feed?cursor=eyJ0IjoxNzMw...&limit=20
200 {
  "posts": [...], "users": {...},
  "nextCursor": "eyJ0IjoxNzMw..." | null
}

POST /api/posts                 { text, mediaIds }      -> 201 Post
POST /api/posts/:id/like                                -> 200 { likeCount, likedByMe }
DELETE /api/posts/:id/like                              -> 200 { likeCount, likedByMe }
POST /api/media (multipart or presigned upload URL)     -> { mediaId }
```

### Cursor vs offset pagination

| | Offset (`?page=3`) | Cursor (`?cursor=opaque`) |
|---|---|---|
| New items inserted at top | Duplicates and skipped items | Stable |
| Jump to page N | Easy | Not supported |
| Performance at depth | Degrades (`OFFSET` scans) | Constant (seek by indexed key) |
| Fit for feeds | Poor | Standard |

The cursor is opaque to the client (e.g. encoded `createdAt + id` or a ranking snapshot id).

### Real-time

New-post notifications are **server to client only** and low frequency, so **SSE** (or long polling) is enough; WebSockets are justified if the same connection also carries chat or typing. Send only ids or a count; fetch content when the user clicks the pill.

## Optimisations

### Infinite scroll

```ts
const sentinel = document.querySelector('#feed-sentinel')!
const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting && !loading && nextCursor) fetchNextPage()
}, { rootMargin: '800px 0px' }) // prefetch well before the end
io.observe(sentinel)
```

- Guard against duplicate fetches; dedupe posts by id when merging pages.
- Show skeleton rows while loading; error row with Retry on failure.
- Provide a footer-reachable alternative (or "Load more" button) since infinite scroll makes the footer unreachable.

### Virtualisation

- Render only posts near the viewport; posts have **variable height**, so measure after render (`ResizeObserver`) and cache heights by id.
- Reserve media space from `width`/`height` so heights are known before images load.
- Keep scroll anchoring stable when items above change height (`overflow-anchor`, or adjust `scrollTop` by the delta).
- Restore scroll position when returning from a post detail (keep cache and measured heights; or open details in a modal route).
- Alternative for moderate lengths: `content-visibility: auto` per post.

### Optimistic likes

```ts
async function toggleLike(id: string) {
  const prev = store.posts[id]
  const next = { ...prev, likedByMe: !prev.likedByMe, likeCount: prev.likeCount + (prev.likedByMe ? -1 : 1) }
  store.update(id, next)
  try {
    const res = await (prev.likedByMe ? api.unlike(id) : api.like(id))
    store.update(id, { ...next, ...res }) // reconcile with server truth
  } catch {
    store.update(id, prev)
    toast('Could not update like')
  }
}
```

Debounce rapid toggles or send the final desired state (`PUT /like { liked: true }`) so the request is idempotent.

### New posts

- Buffer incoming ids in `pendingNewPostIds`; show "N new posts" pill.
- On click: fetch, prepend, scroll to top, move focus to the first new post.
- Don't auto-insert above the viewport (causes jumps and CLS-like disruption).
- Your own new post is inserted optimistically at the top with a pending state.

### Media loading

- Responsive `srcset` and modern formats via an image CDN; dimensions in the data model.
- `loading="lazy"` below the fold; first post's image eager with `fetchpriority="high"` (it's often the LCP).
- Blurhash/LQIP placeholders.
- Video: poster image, `preload="none"`, autoplay muted only when mostly visible (IntersectionObserver), pause when scrolled away.
- Upload: client-side resize/compress, presigned URLs, progress, retry.

### Initial load

- SSR or streaming the first page of posts (or embed it in the HTML) to avoid a client waterfall.
- Code-split the composer, comments and video player.

### Accessibility

- Feed semantics: `role="feed"` containing `<article>` elements with `aria-posinset` / `aria-setsize` (use `-1` when unknown) and `aria-labelledby` the author/heading.
- Keyboard shortcuts (J/K to move between posts) are a nice extra; never trap focus in the list.
- Announce "N new posts" politely; action buttons have names and `aria-pressed` for like.

### Offline, i18n, security

- Cache the last feed for offline reading; queue likes and retry.
- Relative times via `Intl.RelativeTimeFormat`; RTL layouts; locale-aware counts (`Intl.NumberFormat` compact notation).
- Sanitise rich text and link previews (XSS); `rel="noopener noreferrer"` on external links; CSP.

## Running the interview

A 45-minute plan for this question:

| Minutes | Focus |
| --- | --- |
| 0–5 | Requirements: post types, real-time needs, devices, scale of a user's feed |
| 5–12 | Architecture: feed store, list renderer, post components, server APIs, real-time channel |
| 12–20 | Data model (normalised posts and users) and APIs (cursor pagination) |
| 20–35 | Deep dives: infinite scroll with virtualisation, optimistic interactions, new-post banner |
| 35–45 | Media, accessibility, offline and error handling |

## Core implementation sketch

Cursor pagination plus normalised storage keeps the client store simple:

```ts
type Post = { id: string; authorId: string; text: string; likeCount: number; likedByMe: boolean }
type FeedState = {
  postsById: Record<string, Post>
  order: string[] // post ids in display order
  nextCursor: string | null
  loading: boolean
}

async function loadMore(state: FeedState, fetchPage: (cursor: string | null) => Promise<{ posts: Post[]; nextCursor: string | null }>) {
  const reachedEnd = state.nextCursor === null && state.order.length > 0
  if (state.loading || reachedEnd) return state // the caller sets loading before awaiting
  const page = await fetchPage(state.nextCursor)
  const postsById = { ...state.postsById }
  const order = [...state.order]
  for (const post of page.posts) {
    if (!postsById[post.id]) order.push(post.id) // skip duplicates when new posts shifted the page
    postsById[post.id] = post
  }
  return { postsById, order, nextCursor: page.nextCursor, loading: false }
}
```

An optimistic like updates `postsById[id]` immediately (toggle `likedByMe`, adjust `likeCount`), sends the request, and rolls back with a toast on failure. Because posts are stored once by id, the change shows everywhere the post appears.

## Trade-offs to state explicitly

| Decision | Option A | Option B | Choose by |
| --- | --- | --- | --- |
| Pagination | Offset | Cursor | Cursor for feeds: stable when new posts arrive |
| New posts | Insert automatically | "N new posts" banner | Banner: no content jumping under the reader |
| Real-time | Polling | WebSocket or SSE | Update frequency and server cost; SSE is enough for one-way pushes |
| Rendering | Render everything | Virtualise | Virtualise beyond a few hundred variable-height items |
| Initial load | Client fetch | Server-rendered first page | SSR or streaming for faster LCP and SEO |

## Deep-dive questions

**Why cursor pagination?**
The feed changes while the user scrolls; offsets shift and produce duplicates or gaps. A cursor seeks from a stable position and stays fast at depth.

**How do you keep memory bounded in a long session?**
Virtualise the DOM, release media for off-screen posts, and cap the number of cached pages (drop the oldest and refetch if the user scrolls back).

**How do you avoid layout jumps when images load?**
Store media dimensions with the post and reserve the aspect ratio before load.

**What happens if a like fails?**
Roll back to the previous state and show a non-blocking error. Make the API idempotent so retries are safe.

**SSE or WebSocket for new posts?**
SSE: one-way, low frequency, works over HTTP with auto-reconnect. WebSocket only if other bidirectional features share the connection.

**How would you restore scroll position after viewing a post?**
Keep the feed cache and measured heights in memory and restore the virtualiser's offset, or show the post in an overlay route so the feed never unmounts.

## Key takeaways

- Use cursor pagination and dedupe by id; offsets break when new posts arrive.
- Normalise posts and users so updates appear everywhere at once.
- Infinite scroll needs a sentinel observer, a loading guard and virtualisation for long sessions.
- Make likes and comments optimistic with rollback.
- Show new posts behind a banner instead of shifting the list; keep feed items accessible as articles.
