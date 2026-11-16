---
title: Positioning and Stacking Contexts
order: 3
summary: Position values and their containing blocks, what creates a stacking context, why z-index fails, and position sticky gotchas.
---

Dropdowns hidden behind headers, modals that won't sit on top, sticky headers that don't stick — these bugs are all about containing blocks and stacking contexts. Interviewers ask you to explain the rules and debug a broken `z-index`.

## Position values

| Value | In normal flow? | Offsets (`top`, `inset`…) relative to | Typical use |
|---|---|---|---|
| `static` (default) | Yes | Ignored | Normal content |
| `relative` | Yes (space kept) | Its own normal position | Nudging; anchor for absolute children |
| `absolute` | No | Nearest positioned ancestor's padding box | Badges, dropdowns, overlays |
| `fixed` | No | The viewport (usually) | Toasts, fixed headers |
| `sticky` | Yes | Nearest scrolling ancestor, within its parent | Sticky headers, table headings |

`inset: 0` is shorthand for `top: 0; right: 0; bottom: 0; left: 0`.

## Containing blocks

The containing block is the box that percentages and offsets are measured against.

- `static` / `relative` / `sticky`: the content box of the nearest block container ancestor.
- `absolute`: the padding box of the nearest ancestor with `position` other than `static` — **or** one with `transform`, `filter`, `perspective`, `contain: layout`/`paint`, `container-type`, or `will-change` naming one of those.
- `fixed`: the viewport — **unless** an ancestor has `transform`, `filter`, `perspective`, `backdrop-filter`, `contain: layout`/`paint`, `container-type`, or matching `will-change`. Then it behaves like `absolute` relative to that ancestor.

That last rule is a classic bug: a modal with `position: fixed` inside an animated card (with `transform`) suddenly scrolls with the card. Fix it by rendering the modal at the end of `body` (a portal) or using the native `<dialog>` with `showModal()`, which renders in the **top layer** above everything.

```css
.card { position: relative; }
.card .badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem; /* relative to .card's padding box */
}
```

## Stacking contexts

A stacking context is a group of elements painted together as one unit. `z-index` values only compete **within the same stacking context**; a child can never escape its parent context, no matter how high its `z-index`.

### What creates one

- The root element (`html`).
- `position: absolute` or `relative` with a `z-index` other than `auto`.
- `position: fixed` or `sticky` (always, even without `z-index`).
- A flex or grid **item** with `z-index` other than `auto`.
- `opacity` less than 1.
- `transform`, `scale`, `rotate`, `translate`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask` (non-`none` values).
- `mix-blend-mode` other than `normal`.
- `isolation: isolate`.
- `contain: layout` or `paint`, `container-type: size`/`inline-size`.
- `will-change` naming any property that would create one.
- Elements in the top layer (`<dialog>` via `showModal()`, popovers, fullscreen).

### Painting order within a context

From back to front:

1. The context root's background and borders.
2. Children with negative `z-index`.
3. In-flow, non-positioned block boxes.
4. Floats.
5. Inline content.
6. Positioned descendants with `z-index: auto` or `0`, in DOM order.
7. Positioned descendants with positive `z-index`, in ascending order.

## Debugging a z-index bug

```html
<header class="header">            <!-- position: sticky; z-index: 10 -->
  <nav>...</nav>
</header>
<main class="content">              <!-- transform: translateZ(0) — stacking context -->
  <div class="dropdown">...</div>   <!-- position: absolute; z-index: 9999 -->
</main>
```

The dropdown's 9999 only ranks it inside `.content`. `.content` itself is a stacking context with `z-index: auto` (painted at level 0), which is below the header's 10. Fixes, in order of preference:

1. Remove the unnecessary stacking context (the stray `transform` or `opacity`).
2. Give the parent context a `z-index` above the header.
3. Render the dropdown in a portal or use the Popover API / top layer.

Use `isolation: isolate` deliberately on components to contain their internal `z-index` values without side effects. Maintain a small z-index scale with custom properties.

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-toast: 400;
}
```

## The top layer

The top layer sits above every stacking context in the document, regardless of `z-index`.

```html
<button popovertarget="menu">Open</button>
<div id="menu" popover>Menu items</div>

<dialog id="confirm">Are you sure?</dialog>
<script>
  document.querySelector('#confirm').showModal()
</script>
```

- Popovers (`popover` attribute) give light dismiss and top-layer rendering without JavaScript.
- `::backdrop` styles the area behind a modal dialog or popover.
- CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`) can tether a popover to its trigger; check support before relying on it.

## `position: sticky` gotchas

```css
.table-head {
  position: sticky;
  top: 0; /* required: sticky needs a threshold */
  z-index: 1;
  background: var(--surface); /* otherwise content scrolls visibly behind it */
}
```

Sticky fails when:

- No `top`/`bottom`/`left`/`right` is set.
- An ancestor between the element and the scroller has `overflow: hidden`, `auto` or `scroll` — that ancestor becomes the scroll container. (`overflow: clip` doesn't create a scroll container, so it's safe.)
- The parent is no taller than the sticky element: sticky only moves within its parent's box.
- In a flex or grid container, the item stretches to the full height (`align-self: stretch`), leaving no room to stick; set `align-self: start`.
- Table headers: put `position: sticky` on the `th` cells — the most reliable target across browsers.

## Common interview questions

**Difference between `relative`, `absolute` and `fixed`?**
`relative` offsets an element from its normal spot while keeping its space. `absolute` removes it from flow and positions it against the nearest positioned ancestor. `fixed` positions against the viewport unless an ancestor's transform or filter changes the containing block.

**Why doesn't `z-index: 9999` bring my element to the front?**
It's trapped in a parent stacking context that ranks lower than the competing element. `z-index` only compares siblings within the same context.

**What creates a stacking context?**
Positioned elements with a `z-index`, fixed/sticky elements, flex/grid items with `z-index`, `opacity < 1`, transforms, filters, `isolation: isolate`, `will-change`, containment and a few others.

**Does `z-index` work on static elements?**
No, except on flex and grid items, where it works without positioning.

**Why does my fixed modal scroll with the page?**
An ancestor has `transform`, `filter` or similar, which makes it the containing block for fixed descendants. Move the modal to `body` or use `<dialog>`.

**Why isn't my sticky header sticking?**
Usually a missing `top`, an ancestor with `overflow` creating a different scroll container, or a parent that's no taller than the header.

## Pitfalls

- Sprinkling `z-index: 9999` instead of fixing the stacking context.
- Animations with `transform` or `opacity` creating contexts that trap dropdowns.
- `overflow: hidden` on a card clipping its absolutely positioned dropdown.
- Forgetting a background on sticky elements.
