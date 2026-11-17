---
title: Browser and DOM
order: 23
module: browser
summary: DOM nodes and collections, events and listener options, rendering and layout, script loading, storage and cookies, same-origin and CORS details, DOM XSS sinks, CSP and fetch metadata, shadow DOM, service workers, routing, and observers.
---

## What's the difference between a DOM node and an element?

`Node` is the base type for everything in the tree: elements, text, comments, the document and fragments. An `Element` is the kind of node that is a tag. That's why `childNodes` includes whitespace text and comments while `children` holds only elements, and why `textContent` exists on every node but `classList` only on elements.

## Why does looping over `getElementsByClassName` while removing matches skip elements?

It returns a live `HTMLCollection` that updates as the DOM changes, so removing item 0 shifts everything down and the loop index jumps past the next one. `querySelectorAll` returns a static `NodeList` snapshot that doesn't change. `childNodes` is also live; iterate a copy (`[...collection]`) or loop backwards.

## When would you use a `DocumentFragment`?

To assemble many nodes off-document and insert them with a single DOM operation, avoiding repeated insertion and style invalidation. Appending a fragment moves its children into the target and leaves the fragment empty. `<template>.content` is a fragment, and `el.append(...nodes)` gives a similar one-shot insert for a list of nodes.

## How do `innerHTML`, `textContent` and `innerText` differ?

`innerHTML` serialises or parses markup; assigning it is an XSS sink and destroys the existing children along with their listeners and state. `textContent` reads or writes raw text of all descendants, including hidden ones, with no layout cost. `innerText` returns the rendered text, respecting CSS such as `display: none`, so reading it forces layout.

## What are the phases of event propagation?

Capture, from `window` down through ancestors to the target's parent; target, at the element itself; and bubble, back up to `window`. Listeners run in the bubble phase unless registered with `{ capture: true }`. Some events, such as `focus`, `blur`, `mouseenter` and `load` on elements, don't bubble.

## What's the difference between `event.target` and `event.currentTarget`?

`target` is the element the event originated on, possibly a deeply nested child; `currentTarget` is the element whose listener is running right now. In delegation they differ: the listener is on the list, the target is the clicked span inside a button. `currentTarget` is `null` once dispatch finishes, so read it synchronously.

## Why use event delegation, and where does it break down?

One listener on a common ancestor handles events for every current and future child, using `event.target.closest(selector)` to find the item. That means less memory and no re-binding when lists change. It breaks down for events that don't bubble (use `focusin` and `focusout` instead of `focus` and `blur`) and when a descendant calls `stopPropagation`.

## How do `preventDefault`, `stopPropagation` and `stopImmediatePropagation` differ?

`preventDefault` cancels the browser's default action, such as following a link or submitting a form, but the event keeps propagating. `stopPropagation` stops it reaching further elements but other listeners on the current element still run. `stopImmediatePropagation` also skips the remaining listeners on the current element.

## What does a passive event listener buy you?

For `touchstart`, `touchmove` and `wheel`, the browser normally has to wait for your listener in case it calls `preventDefault()` to block scrolling. `{ passive: true }` promises it won't, so scrolling starts immediately. Browsers already treat these listeners on `window`, `document` and `body` as passive by default, and `preventDefault` inside a passive listener is ignored.

## When would you pass `once` or `signal` to `addEventListener`?

`{ once: true }` removes the listener after its first call, which suits one-shot events like `transitionend` or a first-interaction hook. `{ signal }` removes it when an `AbortController` aborts, so one `abort()` can tear down many listeners, including anonymous ones that `removeEventListener` could never match.

## How do you create and dispatch a custom event, and is dispatch asynchronous?

`el.dispatchEvent(new CustomEvent('cart:add', { detail: { id }, bubbles: true }))`. Custom events don't bubble unless you ask, and need `composed: true` to cross shadow DOM boundaries. Dispatch is synchronous: every listener runs before `dispatchEvent` returns, which returns `false` if a cancelable event was cancelled.

## Can a script trigger browser behaviour by dispatching synthetic events?

Partly. Synthetic events have `isTrusted === false`. A synthetic `click` still runs activation behaviour, so a link navigates and a checkbox toggles, but a synthetic `keydown` won't type text. No synthetic event grants user activation, so popups, fullscreen and file pickers opened outside a real gesture are blocked.

## How does the shadow DOM encapsulate a component, and how do events cross its boundary?

A shadow root gives a component its own subtree whose styles don't leak out and whose internals page selectors and `querySelector` can't reach; slots project light-DOM children into it. Events from inside are retargeted so outside listeners see the host element as `target`. Custom events cross the boundary only with `composed: true`, and `event.composedPath()` reveals the real path for open roots.

## Walk me through how the browser turns HTML and CSS into pixels.

Parse HTML into the DOM and CSS into the CSSOM, compute styles for each element, run layout to work out geometry, paint into layers (display lists, rasterised into tiles), then composite the layers on the GPU. JavaScript can invalidate any stage, and the browser redoes only the stages that change requires.

## What triggers a reflow versus a repaint?

Geometry changes trigger layout (reflow) and then paint: width, padding, font size, adding or removing nodes, or changing text. Purely visual changes like `color`, `background` or `visibility` skip layout and repaint only. `transform` and `opacity` on their own compositor layer can skip both and only composite.

## What is layout thrashing, and how do you avoid it?

Alternating DOM writes and layout reads (`offsetHeight`, `getBoundingClientRect`, `scrollTop`) in a loop, which forces the browser to recompute layout synchronously on each read. Batch all reads first and then all writes, schedule writes in `requestAnimationFrame`, or use a library that separates the two phases.

## How do `getBoundingClientRect`, `offsetWidth` and `clientWidth` differ?

`getBoundingClientRect()` returns the border box relative to the viewport, with fractional values and transforms applied. `offsetWidth` is the layout border-box width including scrollbar, rounded to an integer and ignoring transforms. `clientWidth` is the padding box minus any scrollbar. All three force layout if the DOM has pending changes.

## How does a `type="module"` script load by default?

It's deferred automatically: fetched in parallel, executed in order after parsing. It runs in strict mode with its own top-level scope, is fetched with CORS when cross-origin, and executes only once per URL even if included twice. Adding `async` makes it run as soon as it and its imports are ready.

## What's the difference between `DOMContentLoaded` and `load`?

`DOMContentLoaded` fires once the HTML is parsed and deferred and module scripts have run; it doesn't wait for images, iframes or `async` scripts. `load` fires on `window` after every subresource, including images and stylesheets, has finished. Most app initialisation needs only the former.

## Which event should you use to send analytics when the user leaves a page?

`visibilitychange` when `document.visibilityState` becomes `hidden`, sending with `navigator.sendBeacon` or `fetch(url, { keepalive: true })` so the request survives the page going away. `unload` and `beforeunload` don't fire reliably, especially on mobile, and `unload` listeners stop the page entering the back/forward cache. `pagehide` is a reasonable second signal.

## Why can a stylesheet delay a script that comes after it?

A classic script might read computed styles or layout, so the browser won't execute it until every stylesheet earlier in the document has loaded and parsed. A slow CSS file therefore blocks script execution and, through it, HTML parsing. Keep critical CSS small or inline, and put scripts that don't touch styles before slow stylesheets or make them `defer`.

## Why is a host-only cookie safer than one with a `Domain` attribute?

Setting `Domain=example.com` sends the cookie to every subdomain and lets any subdomain overwrite it, so a compromised or user-content subdomain can steal the session or plant a cookie of its own (cookie tossing). Omitting `Domain` makes it host-only. The `__Host-` name prefix enforces this: the browser rejects the cookie unless it's `Secure`, has `Path=/` and has no `Domain`.

## Why can't embedded widgets rely on third-party cookies anymore, and what does `Partitioned` change?

Safari and Firefox block or partition third-party cookies by default, and Chrome lets users block them, so an iframe from another site often can't read the cookie it set elsewhere. A cookie set with `Partitioned` (CHIPS, which also requires `Secure`) is stored per top-level site: the embed gets working state on each host site, but it can't be used to track users across sites.

## How do cookies, `localStorage` and `sessionStorage` differ?

Cookies are about 4 KB each and are sent with every matching request, so they're for server-readable state like sessions. `localStorage` holds roughly 5 MB per origin, persists indefinitely and is shared across tabs. `sessionStorage` has the same API but is scoped to one tab and cleared when it closes. Both Web Storage APIs are synchronous and string-only.

## When would you use IndexedDB instead of `localStorage`?

For large or structured data: thousands of records, blobs and files, data you need to query by index, or anything accessed from a worker or service worker. It's asynchronous and transactional, so it doesn't block the main thread. The raw API is clunky, so most teams use a small wrapper like `idb`.

## How can you sync state between tabs of the same origin?

The `storage` event fires in every other same-origin tab when `localStorage` changes, carrying the key and old and new values. `BroadcastChannel` sends arbitrary structured-cloneable messages between same-origin tabs and workers without touching storage. A `SharedWorker` can also act as a hub.

## What counts as the same origin, and what does "same-site" mean?

Same origin means identical scheme, host and port: `https://app.example.com` and `https://api.example.com` are different origins. Same-site is looser: the same registrable domain (eTLD+1), so those two are same-site. Origin governs DOM and response access; site governs cookie `SameSite` behaviour.

## What does the same-origin policy actually prevent?

Reading across origins: one origin's scripts can't read another's DOM, storage or HTTP response bodies. It does not stop sending requests or embedding resources; cross-origin images, scripts, stylesheets, iframes and form posts all work. That gap is exactly why CSRF is possible.

## Why can't your JavaScript read a custom response header from a cross-origin API?

CORS exposes only the safelisted response headers by default: `Cache-Control`, `Content-Language`, `Content-Length`, `Content-Type`, `Expires`, `Last-Modified` and `Pragma`. Anything else, such as `X-Total-Count` or `ETag`, returns `null` from `response.headers.get` until the server lists it in `Access-Control-Expose-Headers`.

## Which DOM APIs are XSS sinks, and what do you use instead?

Anything that parses strings as markup or code: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string arguments to `setTimeout`, and `href` or `src` set to a `javascript:` URL. Use `textContent`, `createElement` with property assignment, URL validation that allows only `http(s):`, and DOMPurify when HTML is genuinely required. Trusted Types can make the browser enforce this.

## Why is a nonce-based CSP stronger than an allowlist of script domains?

Allowlists are routinely bypassable: an allowed CDN or Google domain usually hosts a JSONP endpoint or an old library that an attacker can load to run arbitrary code. A nonce policy (`script-src 'nonce-r4nd0m' 'strict-dynamic'`) runs only scripts carrying the per-response random value, which injected markup can't guess, and `'strict-dynamic'` extends that trust to scripts those scripts load.

## How can a server use the `Sec-Fetch-Site` header against CSRF?

Browsers attach Fetch Metadata headers to every request: `Sec-Fetch-Site` (`same-origin`, `same-site`, `cross-site` or `none` for user-typed URLs), plus `Sec-Fetch-Mode` and `Sec-Fetch-Dest`. Pages can't forge them, since `Sec-` headers are forbidden to scripts. A server can reject `cross-site` requests to state-changing endpoints while still allowing top-level navigations, as a cheap layer alongside `SameSite` cookies and tokens.

## What can a service worker do that a regular page script can't?

It sits between the page and the network for its scope, intercepting `fetch` events so it can serve responses from the Cache API, enabling offline support and custom caching. It also receives push messages and background sync events while no page is open. It runs on its own thread without DOM access and requires HTTPS.

## Why doesn't a newly deployed service worker take control immediately?

After installing, it waits until every tab controlled by the old version has closed, so one page never runs against two versions of cached assets. `self.skipWaiting()` activates it right away, and `clients.claim()` takes control of already-open pages, at the cost of possibly mixing old page code with new caches.

## When would you choose cache-first, network-first or stale-while-revalidate?

Cache-first for content-hashed static assets and fonts that never change at a given URL. Network-first, with the cache as offline fallback, for HTML and data that must be fresh. Stale-while-revalidate, which serves the cached copy instantly and updates it in the background, for things like avatars or non-critical API data where slightly stale is fine.

## How does client-side routing work with the History API?

`history.pushState(state, '', url)` changes the URL and adds a history entry without a request; `replaceState` swaps the current entry. The app then renders the matching view. `popstate` fires on back and forward, but not on your own `pushState` calls. The server must return the app shell for every deep URL, or a refresh gives a 404.

## What trade-offs come with hash-based routing?

Changes after `#` never reach the server, so it works on static hosts with no rewrite rules, and `hashchange` tells you when it changes. The costs: uglier URLs, the fragment can't be seen by the server or used for server rendering, and it conflicts with in-page anchor links.

## Why prefer `IntersectionObserver` to a scroll listener for visibility checks?

The browser computes intersections itself and calls you asynchronously only when a threshold is crossed, instead of you running code and forcing layout with `getBoundingClientRect` on every scroll event. It's the standard tool for lazy loading, infinite scroll sentinels and impression tracking; `rootMargin` lets you trigger early.

## When do you need a `ResizeObserver`?

When you care about an element's size rather than the window's: charts, virtualised lists, text truncation or component-level responsive logic. Callbacks run after layout in the rendering step. If your callback resizes observed elements in a loop, the browser stops and reports "ResizeObserver loop completed with undelivered notifications".

## When would you use a `MutationObserver`?

To react to DOM changes you don't control, such as third-party widgets, contenteditable or elements appearing after hydration, by watching child lists, attributes or text. Records are batched and delivered as a microtask rather than per change. It replaced the old synchronous mutation events; disconnect it when done, since observing a large subtree is costly.
