---
title: Image Carousel and Gallery
order: 4
summary: Design a reusable carousel and gallery with lightbox — lazy loading, neighbour preloading, responsive images, touch and keyboard input, and accessibility.
---

A carousel looks trivial but touches everything a component library cares about: image performance (it's often the LCP element), gestures, keyboard support, motion preferences and screen-reader semantics. Clarify early whether it's a hero carousel, a product image gallery, or a photo grid with lightbox; the trade-offs differ.

## Requirements

### Clarifying questions

- Use case: marketing hero, product images, user photo album? How many images (5 or 5,000)?
- Autoplay? Looping? Show one slide or several at once?
- Thumbnails strip? Fullscreen lightbox with zoom?
- Mixed media (video)? Captions?
- Data source: static props or paginated API?
- Target devices: touch first? Support for very large screens?

### Functional

- Display one (or N) images with previous/next controls and indicators (dots or thumbnails).
- Swipe on touch, arrow keys on keyboard, optional autoplay with pause.
- Gallery grid that opens a lightbox at the selected image; navigate and close.
- Captions and alt text.

### Non-functional

- First image loads fast (often LCP); others don't compete with it.
- Smooth 60 fps transitions, no layout shift.
- Low bandwidth: only load what's likely to be viewed.
- Accessible to keyboard, screen reader and reduced-motion users.
- Reusable, themeable, SSR-safe.

## Architecture

```text
+---------------------------------------------------------------+
| Carousel (controller: index, direction, autoplay, loop)       |
|                                                               |
|  +---------------------------------------------------------+  |
|  | Viewport (overflow hidden, gesture handlers)            |  |
|  |   Track (translateX / scroll-snap)                      |  |
|  |     Slide[i-1]   Slide[i]   Slide[i+1]  (others lazy)   |  |
|  +---------------------------------------------------------+  |
|  PrevButton   Indicators / Thumbnails   NextButton   Pause    |
|  LiveRegion ("Slide 3 of 8")                                  |
+-------------------------------+-------------------------------+
                                |
                 +--------------v---------------+
                 | Image loader / preloader     |
                 | (srcset, decode(), cache)    |
                 +--------------+---------------+
                                |
                        Image CDN (resize, AVIF/WebP)

Gallery grid --click--> Lightbox (<dialog>) hosting a Carousel at index i
```

Two implementation approaches for the track:

| Approach | How | Pros | Cons |
|---|---|---|---|
| CSS scroll snap | Horizontal scroll container with `scroll-snap-type: x mandatory` | Native momentum and touch, works without JS, accessible scrolling | Less control over animation and infinite looping |
| Transform-based | JS sets `transform: translateX(...)` and handles pointer events | Full control (loop, custom easing, effects) | Must reimplement gestures, inertia and edge cases |

Scroll snap is the modern default for most product carousels; transforms when design demands custom behaviour.

## Data model

```ts
type GalleryImage = {
  id: string
  alt: string
  caption?: string
  width: number
  height: number
  srcBase: string            // CDN path; variants built as `${srcBase}?w=800&fm=avif`
  placeholder?: string       // blurhash or tiny base64 LQIP
}

type CarouselState = {
  index: number
  direction: 'next' | 'prev'
  isPlaying: boolean         // autoplay
  isDragging: boolean
  loaded: Set<string>        // image ids already decoded
}
```

## Interface

### Component API

```ts
type CarouselProps = {
  images: GalleryImage[]
  initialIndex?: number
  index?: number                         // controlled mode
  onIndexChange?: (i: number) => void
  loop?: boolean
  autoplayMs?: number                    // undefined = no autoplay
  slidesPerView?: number
  label: string                          // e.g. "Product images"
}
```

### Server API

```text
GET /api/albums/:id/images?cursor=...&limit=30
200 { "images": [GalleryImage], "nextCursor": "..." | null }
```

Images are served by an image CDN that resizes and negotiates formats (`Accept: image/avif,image/webp`), with long-lived immutable caching on versioned URLs. No real-time transport needed; paginate with cursors for large albums.

## Optimisations

### Responsive images

```html
<img
  src="https://img.cdn.example/p/123?w=800"
  srcset="https://img.cdn.example/p/123?w=400 400w,
          https://img.cdn.example/p/123?w=800 800w,
          https://img.cdn.example/p/123?w=1600 1600w"
  sizes="(min-width: 1024px) 50vw, 100vw"
  width="1600" height="1200" alt="Blue sneaker, side view"
  fetchpriority="high">
```

- `width`/`height` (or `aspect-ratio`) reserve space so nothing shifts.
- Lightbox uses a larger `sizes` (e.g. `100vw`) and may request higher resolution for zoom.

### Lazy loading and preloading neighbours

- First visible slide: eager, `fetchpriority="high"` (it's the LCP candidate).
- Other slides: `loading="lazy"` works for scroll-snap tracks (the browser sees them approach the viewport). For transform-based tracks, render real `src` only for the current slide and its neighbours.
- Preload neighbours (i-1, i+1, and i+2 in the navigation direction) once the current image has loaded and the main thread is idle:

```ts
function preload(img: GalleryImage, width: number) {
  const el = new Image()
  el.src = `${img.srcBase}?w=${width}`
  return el.decode().catch(() => {}) // decode off the critical moment of the transition
}
const whenIdle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
whenIdle(() => [index + 1, index - 1].forEach((i) => images[i] && preload(images[i], 800)))
```

- Respect `navigator.connection?.saveData` and slow connections: skip speculative preloading.
- Show blurhash/LQIP placeholders; fade the full image in on `load`.

### Large galleries

- Grid with lazy thumbnails; virtualise rows for thousands of images.
- Thumbnails at small widths; lightbox fetches large versions only on open.
- Paginate via cursor and a sentinel `IntersectionObserver`.

### Touch and pointer input

- Use Pointer Events (`pointerdown/move/up`) with `setPointerCapture`; `touch-action: pan-y` on the viewport so vertical page scroll still works while horizontal swipes are captured.
- Decide intent after a small threshold (e.g. 10 px): horizontal drag vs vertical scroll.
- Snap to the next slide if dragged past ~30% width or flicked with sufficient velocity.
- Animate with `transform` only; `will-change: transform` during drags.

### Keyboard

| Key | Action |
|---|---|
| Tab | Moves between prev, next, pause and indicator controls (and links within the current slide) |
| Left / Right Arrow | Previous / next slide when focus is in the carousel |
| Home / End | First / last slide (optional) |
| Enter / Space | Activate focused control; open lightbox from a thumbnail |
| Escape | Close the lightbox and return focus to the thumbnail |

### Accessibility

Following the APG carousel pattern:

```html
<section aria-roledescription="carousel" aria-label="Product images">
  <button aria-label="Pause slideshow">...</button>
  <button aria-label="Previous slide">...</button>
  <button aria-label="Next slide">...</button>
  <div aria-live="polite">  <!-- set to "off" while autoplaying -->
    <div role="group" aria-roledescription="slide" aria-label="3 of 8">
      <img alt="Blue sneaker, sole detail" ...>
    </div>
  </div>
</section>
```

- Hidden slides are `inert` (or `aria-hidden` with no focusable children) so Tab doesn't wander into off-screen content.
- Autoplay: provide a visible pause button (WCAG 2.2.2), pause on hover and on focus, and don't autoplay at all under `prefers-reduced-motion: reduce`.
- Indicators are buttons with names ("Go to slide 3") and `aria-current` on the active one, or a tablist if they behave like tabs.
- Lightbox: native `<dialog>` with `showModal()`, labelled, focus moves in and returns on close.
- Meaningful `alt` for product images; captions as visible text.

### Other

- **Reduced motion**: replace slide animation with an instant switch or crossfade.
- **i18n / RTL**: in RTL, "next" is to the left; flip arrow icons and swipe direction (logical properties help).
- **SSR**: render the first slide's markup and image server-side; hydrate controls later; avoid reading `window` width in render.
- **Security**: user-uploaded images served from a separate domain; strip EXIF location on upload.

## Deep-dive questions

**How do you make the carousel's first image fast?**
Server-render it with `srcset`, explicit dimensions and `fetchpriority="high"`, never lazy; defer loading other slides until after it.

**What do you preload, and when?**
The immediate neighbours (biased in the direction of travel) after the current image loads, during idle time, using `decode()` so the swap is instant. Skip on Save-Data.

**Scroll snap or JS transforms?**
Scroll snap gives native touch physics, accessibility and less JS; transforms give infinite loop and custom transitions. Default to scroll snap.

**How do you stop swipes from breaking vertical scrolling?**
`touch-action: pan-y` and an intent threshold: only treat the gesture as a swipe once horizontal movement clearly dominates.

**What a11y issues do autoplay carousels have?**
Moving content distracts and can't be read in time; announcements spam screen readers. Provide pause, stop on hover/focus, turn off the live region while playing, and honour reduced motion.

**How would you build infinite looping?**
With transforms, clone the first and last slides at the ends and jump without animation when you reach a clone; or compute positions modulo length. With scroll snap, it's harder, which is one reason to avoid looping.
