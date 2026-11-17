---
title: Semantic HTML and Document Structure
order: 1
summary: Landmarks, heading outlines, the essential head tags, native elements like dialog and details, and responsive images — what interviewers check in your markup.
---

HTML questions in a frontend screen are rarely about obscure tags. Interviewers look at the markup you write in a machine-coding round and ask short trivia about why it matters: semantics drive accessibility, SEO, reader modes, browser features and default keyboard behaviour for free. A page of `div`s with click handlers is the most common red flag.

## A solid page skeleton

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order history · Acme</title>
    <meta name="description" content="View and track your past orders." />
    <link rel="canonical" href="https://example.com/orders" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://cdn.example.com" />
    <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/app.css" />
    <script type="module" src="/app.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header>…</header>
    <nav aria-label="Primary">…</nav>
    <main id="main">…</main>
    <footer>…</footer>
  </body>
</html>
```

## `<head>` essentials

| Tag | Why |
|---|---|
| `<!doctype html>` | Standards mode; without it you get quirks-mode layout |
| `<html lang="en">` | Screen reader pronunciation, translation, hyphenation |
| `<meta charset="utf-8">` | Must be within the first 1024 bytes, before any text |
| `<meta name="viewport" content="width=device-width, initial-scale=1">` | Without it, mobile browsers render at ~980px and zoom out. Never add `user-scalable=no` |
| `<title>` | Tab label, history, bookmarks, search result title; first thing a screen reader announces |
| `<meta name="description">` | Search snippet candidate |
| `<link rel="canonical">` | Tells crawlers which URL is the original among duplicates |
| `<link rel="preload">` | Fetch a late-discovered critical resource early; needs `as`, and `crossorigin` for fonts |
| `<link rel="preconnect">` | Warm up DNS, TCP and TLS to a third-party origin |
| `<script type="module">` | Deferred by default; `defer` for classic scripts |

### Social and app tags

```html
<meta property="og:title" content="Order history" />
<meta property="og:description" content="View and track your past orders." />
<meta property="og:image" content="https://example.com/og/orders.png" />
<meta property="og:url" content="https://example.com/orders" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#0f172a" />
<link rel="manifest" href="/manifest.webmanifest" />
```

Open Graph tags are read by link-preview crawlers, which generally don't execute JavaScript, so they must be in the server-rendered HTML. That's a common reason to server-render even mostly client-side apps.

## Landmarks

| Element | Implicit role | Notes |
|---|---|---|
| `<header>` | `banner` | Only when not nested inside `article`, `aside`, `main`, `nav` or `section` |
| `<nav>` | `navigation` | Label multiple navs: `aria-label="Breadcrumb"` |
| `<main>` | `main` | One visible per page |
| `<aside>` | `complementary` | Related but separable content |
| `<footer>` | `contentinfo` | Same nesting rule as `header` |
| `<section>` | `region` | Only becomes a landmark when it has an accessible name |
| `<form>` | `form` | Landmark only with an accessible name |
| `<search>` | `search` | New element (2023); wraps search forms |

Screen reader users jump between landmarks the way sighted users scan a layout. A skip link to `<main>` helps keyboard users bypass repeated navigation.

## Heading outline

- One `h1` per page describing the page's purpose is the common convention.
- Don't skip levels going down (`h2` then `h4`); going back up is fine.
- Choose levels by structure, style with CSS. Never pick `h3` because it looks the right size.
- The "document outline algorithm" where each `section` resets heading levels was never implemented by browsers or screen readers and has been removed from the spec. Use explicit levels.

Headings are the main navigation tool for screen reader users: many list headings first to skim a page.

## Semantic elements vs `div`

| Instead of | Use | What you get free |
|---|---|---|
| `<div onclick>` | `<button type="button">` | Focusable, Enter and Space activation, role, disabled state |
| `<div onclick="location=…">` | `<a href>` | Open in new tab, copy link, history, middle-click |
| `<div class="list">` | `<ul>` / `<ol>` | "List, 5 items" announced |
| `<div class="table">` | `<table>` with `<th scope>` | Row/column header navigation |
| Bold div as label | `<label for>` | Click-to-focus, accessible name |
| `<div class="date">` | `<time datetime="2026-11-17">` | Machine-readable date |
| `<div class="quote">` | `<blockquote>`, `<q>`, `<cite>` | Meaning for assistive tech and reader modes |
| `<div class="figure">` | `<figure>` + `<figcaption>` | Caption associated with the content |
| `<span class="term">` | `<abbr title>`, `<code>`, `<kbd>`, `<mark>` | Semantics that survive without CSS |

`<article>` is for self-contained content that could be syndicated (a post, a comment, a product card); `<section>` is a thematic grouping with a heading. If neither fits, a `div` is correct; it's for styling hooks, not a failure.

## `<dialog>` and `<details>`

```html
<button type="button" id="open">Delete account</button>
<dialog id="confirm" aria-labelledby="confirm-title">
  <form method="dialog">
    <h2 id="confirm-title">Delete your account?</h2>
    <p>This cannot be undone.</p>
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
<script type="module">
  const dialog = document.querySelector('#confirm')
  document.querySelector('#open').addEventListener('click', () => dialog.showModal())
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'delete') deleteAccount()
  })
</script>
```

`showModal()` gives you a top-layer modal with an inert background, a `::backdrop`, Escape to close and focus moved inside; focus returns to the opener on close in current browsers. `show()` opens it non-modally. `<form method="dialog">` closes the dialog and sets `returnValue` to the submitting button's value. The `popover` attribute covers non-modal overlays like menus and toasts.

```html
<details name="faq">
  <summary>What is the return policy?</summary>
  <p>Unused items can be returned within 30 days.</p>
</details>
```

`<details>`/`<summary>` is a native disclosure with keyboard support and no JS. Sharing a `name` across several makes them an exclusive accordion. Use `<details>` for show/hide content, not for navigation menus that need different semantics.

## Images and media

```html
<img src="/hero-800.jpg"
     srcset="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1600.jpg 1600w"
     sizes="(min-width: 60rem) 50vw, 100vw"
     width="1600" height="900"
     alt="Two people reviewing a dashboard on a laptop"
     fetchpriority="high" />

<img src="/below-fold.jpg" loading="lazy" decoding="async" width="600" height="400" alt="" />

<picture>
  <source type="image/avif" srcset="/photo.avif" />
  <source type="image/webp" srcset="/photo.webp" />
  <img src="/photo.jpg" alt="Mountain lake at sunrise" width="1200" height="800" />
</picture>
```

- `alt` describes the image's purpose in context; `alt=""` marks decorative images so they're skipped. Missing `alt` makes screen readers read the filename.
- `width` and `height` let the browser reserve space from the aspect ratio, preventing layout shift (CLS).
- `srcset` with `w` descriptors plus `sizes` lets the browser pick by viewport and pixel density; `<picture>` is for format fallbacks or art direction.
- Never lazy-load the LCP image; give it `fetchpriority="high"` instead.
- `<video>` needs `controls` (or custom accessible controls), `<track kind="captions">` for speech, and `muted playsinline` for autoplay on mobile.

## What interviewers check

- Buttons are `<button>`, links are `<a href>`, and the two aren't swapped.
- Every input has a label; every meaningful image has `alt`.
- Headings form a sensible outline; landmarks exist.
- Lists and tables are real lists and tables.
- No ARIA where a native element would do.
- `lang`, `viewport` and `title` are present in a full page.

## Common interview questions

**Why does semantic HTML matter if it looks the same?**
Semantics feed the accessibility tree, search engines, reader modes and browser behaviour such as keyboard activation and form submission. A styled `div` looks identical but is invisible as a control to assistive tech and does nothing on Enter.

**`<section>` vs `<article>` vs `<div>`?**
`article` is self-contained and could stand alone; `section` groups related content under a heading; `div` has no meaning and is for styling or layout. Use `div` when no semantic element fits rather than forcing one.

**What happens without the viewport meta tag?**
Mobile browsers assume a desktop-width layout viewport, around 980px, and scale the page down. Media queries based on width won't match as intended and text becomes tiny.

**`preload` vs `prefetch` vs `preconnect`?**
`preload` fetches a resource needed for the current page at high priority. `prefetch` fetches a likely next-navigation resource at low priority. `preconnect` only sets up the connection to an origin.

**Why use `<dialog>` instead of a custom modal?**
`showModal()` handles the top layer, inert background, Escape, and focus placement natively, which are the parts custom modals usually get wrong. You still provide a heading/label and sensible initial focus.

**How do you decide what `alt` text to write?**
Describe what the image contributes in that context, not its appearance in detail. If the image is decorative or repeats adjacent text, use `alt=""`; if it's a link or button with no text, describe the destination or action.

**Should a page have only one `h1`?**
Not required by the spec, but one `h1` naming the page is the widely recommended practice because screen reader users use it to confirm where they are. What matters more is a logical, non-skipping hierarchy below it.

**Why do social preview tags need server rendering?**
Link-preview crawlers usually fetch the HTML and don't run JavaScript. Tags injected client-side are never seen, so the preview falls back to defaults.
