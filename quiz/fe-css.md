---
title: CSS
order: 25
module: css
summary: Cascade, specificity and layers, the box model and formatting contexts, flexbox and grid details, stacking contexts, units, modern selectors, animation performance and styling trade-offs.
---

## How does the browser decide which of two conflicting declarations wins?

It compares them step by step and stops at the first difference: origin and importance, then shadow-DOM context, then whether one is an inline `style` attribute, then cascade layer, then specificity, and finally source order (later wins). Specificity only matters once everything above it ties.

## How would you work out the specificity of `#nav .item a:hover`?

Count three columns: IDs, then classes/attributes/pseudo-classes, then types/pseudo-elements. Here that is one ID, two in the middle column (`.item`, `:hover`) and one type (`a`), so (1, 2, 1). Columns are compared left to right with no carry, so one ID beats any number of classes.

## Why can a user stylesheet's `!important` override your `!important`?

Because `!important` reverses the origin order: for normal declarations author beats user beats browser, but for important ones browser beats user beats author. That reversal exists so users with accessibility needs always get the final say.

## Why would you import third-party CSS into a cascade layer?

Layer order is checked before specificity, so a library's heavily qualified selectors in an early layer lose to your simple ones in a later layer: `@import url(lib.css) layer(vendor);`. Unlayered styles beat all layered ones, so anything you leave outside layers still wins.

## What happens to `!important` declarations inside cascade layers?

The layer order flips: an `!important` in an earlier layer beats one in a later layer, and layered `!important` beats unlayered `!important`. This lets a low-level reset layer protect a few declarations that nothing later can override.

## Which properties inherit by default, and how do you control it?

Mostly text-related ones: `color`, `font-*`, `line-height`, `letter-spacing`, `visibility`, `cursor`. Box properties like `margin`, `padding`, `border` and `background` do not. You can force behaviour with `inherit`, `initial`, `unset` (inherit if inheritable, else initial), `revert` (back to the browser default) and `revert-layer`.

## When would you use `:where()` instead of `:is()`?

Both match if any selector in the list matches and both tolerate invalid selectors in the list. `:is()` takes the specificity of its most specific argument, while `:where()` always contributes zero, which makes `:where()` ideal for resets and library defaults that consumers must be able to override with a single class.

## What does `:has()` let you select that was impossible before?

Elements based on what they contain or what follows them, effectively a parent and previous-sibling selector: `form:has(:invalid)`, `label:has(+ input:checked)`, `.card:has(img)`. Its specificity is that of its most specific argument, and broad selectors like `body:has(...)` should be used sparingly because every DOM change can trigger re-matching.

## Why do most codebases set `box-sizing: border-box` globally?

With the default `content-box`, `width` sets only the content area and padding and border are added on top, so a `width: 100%` element with padding overflows its parent. With `border-box` the declared width includes padding and border, which matches how designers think. The usual reset is `*, *::before, *::after { box-sizing: border-box; }`.

## What is a block formatting context and how do you create one?

An independent layout region whose contents cannot interact with the outside: it contains its floats, stops its children's margins collapsing through it, and does not overlap neighbouring floats. `display: flow-root` creates one with no side effects; `overflow` other than `visible`, flex and grid items, `inline-block` and absolute positioning also do.

## When do vertical margins collapse?

Between adjacent block siblings in normal flow, between a parent and its first or last child when no border, padding, content or new formatting context separates them, and through empty blocks. Two positive margins become the larger one; a positive and a negative are summed. Margins never collapse horizontally, or inside flex and grid containers.

## How do `display: none`, `visibility: hidden` and `opacity: 0` differ?

`display: none` removes the box from layout and the accessibility tree. `visibility: hidden` keeps the space but hides it from assistive tech and pointer events, and a child can opt back in with `visibility: visible`. `opacity: 0` keeps the space and is still clickable, focusable and announced, which is a common accessibility bug.

## Why doesn't `width` or vertical `margin` work on an inline element?

Inline boxes are sized by their content and line box, so `width`, `height` and vertical margins are ignored (vertical padding paints but does not push lines apart). `inline-block` keeps inline flow while honouring box dimensions, at the cost of whitespace gaps between elements from the HTML.

## Why doesn't `::before` render on an `<img>` or `<input>`?

Pseudo-elements are inserted as children of the element's content box, and replaced elements like `<img>`, `<input>` and `<video>` have no content box for CSS to insert into. Wrap the element or use a sibling instead. Also remember `::before`/`::after` render nothing without a `content` property.

## What does `flex: 1` expand to, and how does it differ from `flex: auto`?

`flex: 1` is `1 1 0%`: grow, shrink, and a basis of zero, so items split the space equally regardless of their content. `flex: auto` is `1 1 auto`: items start from their content size and only the leftover space is shared, so wider content gets wider items.

## Why does a flex item with long text refuse to shrink below its content?

Flex items default to `min-width: auto`, which resolves to the min-content width, so long words or a `<pre>` force overflow. Set `min-width: 0` (or `overflow: hidden`) on the item so it can shrink and the text can wrap or truncate.

## Why can `1fr` grid columns end up with unequal widths?

`1fr` really means `minmax(auto, 1fr)`, so a track cannot shrink below its content's minimum size and one long word or wide image widens its column. Use `minmax(0, 1fr)` when columns must be exactly equal.

## When would you choose grid over flexbox?

Grid when the layout is two-dimensional or defined by the container: you declare tracks and place items into them. Flexbox when it is one-dimensional and content-driven, like a toolbar where items size themselves and wrap. They compose well; a grid page layout with flex rows inside is normal.

## What is the difference between `auto-fill` and `auto-fit` in `repeat()`?

Both create as many tracks as fit the container. `auto-fill` keeps the empty tracks, so a few items stay at their minimum width; `auto-fit` collapses empty tracks to zero so the existing items stretch to fill the row. `repeat(auto-fit, minmax(16rem, 1fr))` is the classic responsive card grid with no media queries.

## What problem does `subgrid` solve?

A nested grid normally defines its own tracks, so the titles, bodies and footers of separate cards cannot line up. With `grid-template-rows: subgrid` the child grid reuses the parent's tracks, so content aligns across siblings without fixed heights. It is supported in all major browsers.

## What is the containing block of an absolutely positioned element?

The padding box of its nearest ancestor with a `position` other than `static`. Ancestors with `transform`, `filter`, `perspective`, `contain: paint` or a matching `will-change` also become the containing block. If none exists, it is the initial containing block, roughly the first viewport.

## Why does `position: fixed` stop being relative to the viewport inside some parents?

An ancestor with `transform`, `filter`, `backdrop-filter`, `perspective`, `contain: paint` or `will-change: transform` becomes the containing block for fixed descendants. A modal rendered inside an animated card then scrolls and clips with the card, which is one reason modals are rendered in a portal or the top layer.

## Why isn't my `position: sticky` element sticking?

Usual causes: no threshold such as `top: 0`, an ancestor with `overflow: hidden` or `auto` that becomes the scroll container instead of the page, or a parent only as tall as the sticky element so it has no room to stick. Sticky is bounded by its parent and never leaves it.

## Why doesn't `z-index: 9999` bring my element to the front?

`z-index` only competes within the same stacking context. If an ancestor creates one (via `transform`, `opacity < 1`, `filter`, a positioned element with `z-index`, and so on), the child is painted as part of that ancestor and cannot rise above the ancestor's siblings. Fix the ancestor's stacking, move the element out with a portal, or use the top layer (`<dialog>` with `showModal()`, popover).

## Which properties create a new stacking context?

The root element; positioned elements with a `z-index` other than `auto`; `position: fixed` and `sticky`; flex or grid items with a `z-index`; `opacity` below 1; non-`none` `transform`, `filter`, `backdrop-filter`, `clip-path`, `mask` or `perspective`; `mix-blend-mode`; `isolation: isolate`; `contain: paint`; container queries' `container-type`; and `will-change` naming any of these.

## When would you use `isolation: isolate`?

To create a stacking context with no other visual side effect. Putting it on a component's root keeps that component's internal `z-index` values local, so its layered children cannot interleave with or escape over the rest of the page.

## When do you use `rem` versus `em`?

`rem` is relative to the root font size, giving one predictable scale that also respects the user's browser font setting, so it suits type and spacing tokens. `em` is relative to the element's own font size (the parent's when used on `font-size`), so it compounds when nested but is useful for padding that should scale with a component's text, like buttons.

## Why is `100vh` unreliable on mobile, and what replaced it?

On mobile, `vh` is based on the largest viewport with the browser toolbars retracted, so a `100vh` hero is partly hidden behind the address bar. The newer units are `svh` (small viewport, toolbars shown), `lvh` (large) and `dvh` (dynamic, updates as toolbars move). `min-height: 100dvh` is the usual fix; `svh` avoids relayout while scrolling.

## What is a percentage `padding-top` relative to?

The width of the containing block, even for vertical padding and margins. That quirk powered the old `padding-top: 56.25%` aspect-ratio hack, now replaced by `aspect-ratio: 16 / 9`. A percentage `height`, by contrast, only resolves if the parent has a definite height.

## When is the `ch` unit useful?

`1ch` is the width of the "0" glyph in the current font, so `max-width: 65ch` caps a paragraph at a readable line length that scales with the font. It is approximate for proportional fonts but good enough for measure.

## How does `clamp()` give you fluid typography, and what mistake should you avoid?

`clamp(min, preferred, max)` resolves to the preferred value bounded by the other two, e.g. `font-size: clamp(1rem, 0.85rem + 0.75vw, 1.5rem)`. Always mix a `rem` term into the preferred value: pure `vw` text ignores browser zoom and fails WCAG's resize-text requirement.

## Why prefer container queries over media queries for components?

Media queries respond to the viewport, but a reusable card might sit in a wide main column or a narrow sidebar on the same screen. With `container-type: inline-size` on a wrapper, `@container (min-width: 30rem)` lets the component adapt to the space it actually has. An element cannot query its own size, only an ancestor container's.

## What is the difference between a CSS transition and a CSS animation?

A transition interpolates a property between two values when it changes, so it needs a trigger like a class or `:hover`. An animation runs `@keyframes` with any number of steps, can start on its own, loop, alternate and be paused. Use transitions for state changes, animations for choreographed or repeating motion.

## Which properties are cheap to animate, and why?

`transform` and `opacity`, because the browser can apply them on the compositor without recalculating layout or repainting. Animating `width`, `height`, `top`, `left` or `margin` triggers layout every frame and janks on slower devices. Move with `translate`, resize with `scale`.

## What does `will-change` cost you?

It hints the browser to promote the element to its own compositor layer, which uses GPU memory and creates a stacking context and containing block. Applied broadly it wastes memory and can slow things down; add it just before an animation that measurably stutters and remove it afterwards.

## How do you respect users who are sensitive to motion?

Wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)` or tone it down inside `@media (prefers-reduced-motion: reduce)`, replacing large movements with fades or instant changes. Parallax, auto-playing carousels and big zoom transitions are the usual culprits.

## How are CSS custom properties different from Sass variables?

Sass variables are replaced at build time and never reach the browser. Custom properties are live: they cascade, inherit, can be redefined per element, per media query or per theme, and can be changed from JavaScript with `style.setProperty`. That makes them the natural carrier for design tokens and theming.

## What happens when a custom property holds a value that is invalid where it's used?

The declaration becomes "invalid at computed-value time" and the property behaves as `unset`: it inherits or falls back to its initial value. It does not fall back to an earlier valid declaration of the same property, because the browser cannot know the value is bad until it substitutes the variable.

## Why can't you transition a custom property unless you register it with `@property`?

An unregistered custom property is an untyped token stream, so the browser can only swap it discretely. `@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }` gives it a type, which makes it interpolatable, enabling things like animated gradients.

## Why use logical properties like `margin-inline-start`?

They map to physical sides based on writing mode and direction, so the same stylesheet works for left-to-right, right-to-left and vertical text. `padding-inline`, `margin-block`, `inset-inline-end` and `inline-size` replace their left/right/top/bottom equivalents and are fully supported.

## How do you centre an element horizontally and vertically, and which do you reach for first?

On the parent, `display: grid; place-items: center;` is the shortest. Flexbox with `justify-content` and `align-items` set to `center` works too. For an overlay, `position: absolute; inset: 0; margin: auto;` with a set size, or `top: 50%; left: 50%; translate: -50% -50%`. Horizontal-only for a block: `margin-inline: auto`.

## What does `display: contents` do, and why be careful with it?

It removes the element's own box so its children participate directly in the parent's flex or grid layout. Browsers historically also dropped the element's semantics from the accessibility tree, breaking buttons, lists and headings; support has improved, but test with a screen reader before using it on anything meaningful.

## How do you compare runtime CSS-in-JS, CSS Modules and utility CSS?

Runtime CSS-in-JS (styled-components, Emotion) gives colocated, prop-driven styles but serialises and injects CSS during render, costing performance and fitting poorly with Server Components and streaming. CSS Modules scope plain CSS at build time with no runtime. Utility CSS like Tailwind avoids naming, enforces design tokens and keeps CSS size flat, at the cost of busy markup. Zero-runtime CSS-in-JS (vanilla-extract, Panda) is the middle ground.
