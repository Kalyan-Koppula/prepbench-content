---
title: Flexbox and Grid
order: 2
summary: The mental model of each layout system, when to choose which, and the classic layouts you should be able to write from memory.
---

Most layout questions come down to "flex or grid?" plus a live build: centre this, make a card grid that wraps, keep the footer at the bottom. Know the mental model of each so you can reason about sizing instead of guessing properties.

## Mental models

| | Flexbox | Grid |
|---|---|---|
| Dimensions | One axis at a time (a row or a column) | Two axes at once (rows and columns) |
| Driven by | Content: items size themselves, then share leftover space | Container: tracks are defined, items are placed into them |
| Best for | Toolbars, nav bars, button groups, centering, media objects | Page layouts, card grids, forms, dashboards, overlapping items |
| Alignment across rows | Each wrapped line is independent | Columns line up across rows |

Rule of thumb: if you care about alignment in both directions, use grid. If items should flow and size to their content along a line, use flex. They nest happily.

## Flexbox essentials

```css
.toolbar {
  display: flex;
  flex-direction: row;          /* main axis */
  justify-content: space-between; /* along main axis */
  align-items: center;          /* along cross axis */
  gap: 0.5rem;
  flex-wrap: wrap;
}
```

### The `flex` shorthand

`flex: <grow> <shrink> <basis>`

| Value | Expands to | Behaviour |
|---|---|---|
| `flex: initial` (default) | `0 1 auto` | Content-sized, can shrink, won't grow |
| `flex: 1` | `1 1 0%` | Grow equally from zero; equal-width columns |
| `flex: auto` | `1 1 auto` | Grow from content size; bigger content gets bigger share |
| `flex: none` | `0 0 auto` | Rigid, content-sized |

Sizing algorithm in brief: each item starts at its `flex-basis` (or content size for `auto`); leftover space is shared by `flex-grow` ratio; overflow is removed by `flex-shrink` weighted by basis.

### The min-width gotcha

Flex items default to `min-width: auto`, meaning they won't shrink below their content's minimum size. Long words, `pre` blocks or wide children cause overflow.

```css
.main {
  flex: 1;
  min-width: 0; /* allow shrinking below content size; enables text-overflow: ellipsis */
}
```

Grid items have the same default; `minmax(0, 1fr)` is the grid equivalent.

### Useful tricks

- `margin-left: auto` on one item pushes it (and everything after it) to the end.
- `align-self` overrides alignment for a single item; `order` changes visual order only (screen readers and tab order follow DOM order).
- `gap` works in flex in all modern browsers; no more negative-margin hacks.

## Grid essentials

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}
```

| Concept | Meaning |
|---|---|
| `fr` | A fraction of the remaining free space |
| `repeat(3, 1fr)` | Three equal columns |
| `minmax(200px, 1fr)` | At least 200px, at most one fraction |
| `auto-fill` | Create as many tracks as fit, keeping empty ones |
| `auto-fit` | Same, but collapse empty tracks so items stretch |
| `grid-template-areas` | Name regions with ASCII art |
| `grid-column: 1 / -1` | Span from the first to the last line |
| `subgrid` | Child grid uses the parent's tracks (aligned card internals) |
| Implicit tracks | Rows/columns created automatically; size them with `grid-auto-rows` |

## Common layouts

### Centering

```css
/* Grid: shortest */
.center {
  display: grid;
  place-items: center;
}

/* Flex */
.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Absolutely positioned, unknown size */
.overlay-child {
  position: absolute;
  inset: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
}
```

### Responsive card grid

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: 1.5rem;
}
```

- No media queries: columns are added as space allows.
- `min(240px, 100%)` prevents overflow when the container is narrower than 240px.
- Use `auto-fit` instead if a few items should stretch to fill the row.

### Holy grail layout

```css
.page {
  display: grid;
  min-height: 100dvh;
  grid-template:
    'header header header' auto
    'nav    main   aside' 1fr
    'footer footer footer' auto
    / 200px 1fr 200px;
}
.page > header { grid-area: header; }
.page > nav    { grid-area: nav; }
.page > main   { grid-area: main; }
.page > aside  { grid-area: aside; }
.page > footer { grid-area: footer; }

@media (width < 768px) {
  .page {
    grid-template:
      'header' auto
      'nav' auto
      'main' 1fr
      'aside' auto
      'footer' auto
      / 1fr;
  }
}
```

### Sticky footer

```css
body {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto; /* header, main grows, footer */
  margin: 0;
}

/* Flex alternative */
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.app > main { flex: 1; }
```

The footer sits at the bottom on short pages and below the content on long ones. `dvh` accounts for mobile browser toolbars.

### Media object and nav bar

```css
.media { display: flex; gap: 1rem; align-items: flex-start; }
.media > img { flex: none; width: 64px; }
.media > .body { flex: 1; min-width: 0; }

.nav { display: flex; align-items: center; gap: 1rem; }
.nav .account { margin-left: auto; } /* push to the right */
```

## How flex sizes are calculated

`flex: 1 1 200px` means `flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 200px`. The algorithm:

1. Start every item at its **flex basis** (or its content size for `auto`).
2. Compare the total with the container. If there is **free space**, share it in proportion to `flex-grow`. If items **overflow**, take space away in proportion to `flex-shrink × flex-basis`.
3. Clamp each item by its `min-width`/`max-width` and repeat for the rest if any item hit a limit.

Example: a 900px row with three items.

| Item | `flex` | Basis | Grow share | Final width |
| --- | --- | --- | --- | --- |
| A | `1 1 200px` | 200 | 1 / 4 of 300 = 75 | 275px |
| B | `2 1 200px` | 200 | 2 / 4 of 300 = 150 | 350px |
| C | `1 1 200px` | 200 | 1 / 4 of 300 = 75 | 275px |

Free space is 900 − 600 = 300px, split 1 : 2 : 1. Note that B isn't twice as **wide** as A; it receives twice as much of the **extra** space. To get exact proportions, use a basis of 0: `flex: 1` (which is `1 1 0%`) and `flex: 2` give 300px and 600px of a 900px row.

### The `min-width: auto` trap

Flex items default to `min-width: auto`, which means "not narrower than my content". A long URL or a wide table inside an item prevents it from shrinking and overflows the container. The fix is `min-width: 0` on the item (or `overflow: hidden`), which is also why text truncation with `text-overflow: ellipsis` inside flex items often needs it.

## How grid tracks are sized

```css
.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) minmax(200px, 25%);
  gap: 16px;
}
```

1. Fixed tracks take their size: 240px.
2. `minmax(min, max)` tracks start at their minimum.
3. Gaps are subtracted.
4. Remaining space goes to `fr` tracks in proportion to their factors (and to `max` limits).

`1fr` is really `minmax(auto, 1fr)`: like flex items, it won't shrink below its content's minimum size. `minmax(0, 1fr)` lets a column shrink, which matters for code blocks and long words.

### `auto-fit` versus `auto-fill`

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
```

Both create as many 220px-or-wider columns as fit. With few items, `auto-fill` keeps the empty column tracks (items stay 220px-ish), while `auto-fit` collapses empty tracks so the existing items stretch to fill the row. This one line produces a responsive card grid with no media queries.

## Subgrid

Nested grids normally have their own tracks, so cards in a row can't line up their titles and footers. `subgrid` lets a child grid use its parent's tracks:

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); }
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* title, body, footer rows shared across the row of cards */
}
```

Now every card's footer sits on the same line even when bodies have different lengths.

## Alignment cheat sheet

| Property | Flexbox | Grid |
| --- | --- | --- |
| `justify-content` | Distributes items along the main axis | Distributes tracks along the inline axis |
| `align-items` | Aligns items on the cross axis | Aligns items in their row area |
| `justify-items` | (ignored) | Aligns items in their column area |
| `align-content` | Distributes lines when wrapping | Distributes tracks along the block axis |
| `align-self` / `justify-self` | Per item on the cross axis / (ignored) | Per item |
| `place-items`, `place-content` | Shorthands for align + justify | Same |

Centring anything: `display: grid; place-items: center;` on the parent.

## Common interview questions

**When do you choose grid over flexbox?**
When layout is two-dimensional or defined by the container (page regions, aligned card grids). Flexbox for one-dimensional, content-driven arrangements like toolbars or button groups.

**What does `flex: 1` mean?**
`flex-grow: 1; flex-shrink: 1; flex-basis: 0%` — the item ignores its content size and takes an equal share of the free space.

**`auto-fill` vs `auto-fit`?**
Both create as many tracks as fit. `auto-fill` keeps empty tracks, so few items stay narrow; `auto-fit` collapses empty tracks, so items stretch across the row.

**Why does my flex item overflow its container?**
Its automatic minimum size is its content's min-content width. Set `min-width: 0` (or `overflow: hidden`) on the item.

**How do you centre a div?**
`display: grid; place-items: center` on the parent, or flex with `justify-content` and `align-items` set to `center`.

**Does `order` or grid placement affect accessibility?**
Yes: visual order changes but DOM, reading and focus order don't, which can confuse keyboard and screen-reader users. Prefer reordering the source.

## Pitfalls

- Using `100vh` on mobile; use `dvh`/`svh` for viewport-height layouts.
- Forgetting `min-width: 0` on flexible children with long text.
- `1fr` columns blowing out from wide content; use `minmax(0, 1fr)`.
- Building whole page grids with nested flex containers and percentage widths.
- Using `justify-content` to align a single grid item; use `justify-self` or `place-self`.

## Key takeaways

- Flexbox lays out along one axis from content outwards; grid lays out in two dimensions from the container inwards.
- `flex-grow` shares **extra** space; use a basis of 0 for exact ratios.
- Flex items and `1fr` tracks won't shrink below their content: add `min-width: 0` or `minmax(0, 1fr)`.
- `repeat(auto-fit, minmax(…, 1fr))` gives a responsive grid without media queries.
- `subgrid` aligns nested content to the parent grid.
- Prefer `gap` over margins for spacing between items.
