---
title: Cascade and Specificity
order: 1
summary: How the browser picks the winning declaration — origins, importance, layers, specificity, order — plus :is/:where and inheritance.
---

"Why isn't my style applying?" is the everyday version of this topic. Interviewers want the full decision order, quick specificity maths, and modern tools for controlling it: `:where()`, `:is()` and cascade layers.

## The cascade, in order

When several declarations set the same property on the same element, the browser compares them step by step and stops at the first difference.

1. **Origin and importance**
2. **Context** (shadow DOM: outer styles vs component styles)
3. **Element-attached styles** (the `style` attribute)
4. **Cascade layers**
5. **Specificity**
6. **Order of appearance** (later wins)

Origin and importance precedence, highest first:

| Rank | Declarations |
|---|---|
| 1 | CSS transitions |
| 2 | `!important` user-agent |
| 3 | `!important` user |
| 4 | `!important` author |
| 5 | CSS animations |
| 6 | Normal author (your stylesheets) |
| 7 | Normal user |
| 8 | Normal user-agent (browser defaults) |

Note the reversal: `!important` flips the origin order, so users and the browser can always override author `!important` for accessibility.

## Specificity

Specificity is a triple **(A, B, C)** compared left to right. No amount of B beats one A.

| Component | Counts |
|---|---|
| A | ID selectors `#id` |
| B | Classes `.x`, attributes `[type="text"]`, pseudo-classes `:hover`, `:nth-child()` |
| C | Type selectors `div`, pseudo-elements `::before` |
| 0 | Universal `*`, combinators (`>`, `+`, `~`, space), `:where()` |

| Selector | Specificity |
|---|---|
| `p` | (0, 0, 1) |
| `.card p` | (0, 1, 1) |
| `a:hover` | (0, 1, 1) |
| `ul li::marker` | (0, 0, 3) |
| `.nav .item.active` | (0, 3, 0) |
| `#main .title` | (1, 1, 0) |
| `input[type="email"]:focus` | (0, 2, 1) |
| `:where(#main) p` | (0, 0, 1) |
| `:is(#main, .x) p` | (1, 0, 1) |
| `:not(.hidden)` | (0, 1, 0) |
| `li:nth-child(2 of .done)` | (0, 2, 1) |

Puzzle: `#nav a` (1, 0, 1) vs `.menu .link:hover` (0, 3, 0). The ID selector wins regardless of the three classes.

Inline `style` attributes beat any selector in the author origin; only `!important` (or animations/transitions) beats them.

## `:is()`, `:where()`, `:not()`, `:has()`

```css
/* Same matching; different specificity */
:is(header, footer) a:hover { color: var(--accent); }   /* (0, 1, 2) */
:where(header, footer) a:hover { color: var(--accent); } /* (0, 1, 1) */
```

| Pseudo-class | Specificity |
|---|---|
| `:is(...)` | Its most specific argument |
| `:not(...)` | Its most specific argument |
| `:has(...)` | Its most specific argument |
| `:where(...)` | Always zero |

- `:is()` and `:where()` are **forgiving**: an invalid selector in the list is ignored instead of invalidating the whole rule.
- Use `:where()` in resets and library base styles so consumers can override them with any single class.
- `:is()` can silently inflate specificity: one ID in the list makes the whole thing (1, 0, 0).

## Cascade layers

`@layer` lets you group styles and order the groups explicitly. Layer order beats specificity.

```css
@layer reset, base, components, utilities;

@layer reset {
  :where(*) { margin: 0; }
}
@layer components {
  #sidebar .button { background: gray; }   /* high specificity, earlier layer */
}
@layer utilities {
  .bg-accent { background: var(--accent); } /* wins: later layer */
}
```

Rules:

- Layers declared later win over earlier ones for normal declarations.
- **Unlayered styles beat all layered styles** (for normal declarations).
- For `!important`, the order reverses: earlier layers win, and layered `!important` beats unlayered `!important`.
- Import third-party CSS into a low layer: `@import url('lib.css') layer(vendor);`.
- Nested layers: `@layer components.forms { ... }`.
- `revert-layer` rolls a property back to the value from the previous layer.

## Inheritance

Some properties inherit from the parent by default; others don't.

| Inherited by default | Not inherited |
|---|---|
| `color`, `font-*`, `line-height`, `letter-spacing` | `margin`, `padding`, `border` |
| `text-align`, `text-transform`, `white-space` | `background`, `width`, `height` |
| `visibility`, `cursor`, `list-style` | `display`, `position`, `z-index` |
| Custom properties (`--x`) | `overflow`, `opacity`, `transform` |

An inherited value has **no specificity**: any rule that targets the element directly beats it, even `*`.

```css
#article { color: navy; }
* { color: black; }   /* <p> inside #article is black: direct match beats inheritance */
```

### Global keywords

| Keyword | Result |
|---|---|
| `inherit` | Take the parent's computed value |
| `initial` | The property's spec initial value (e.g. `display: inline`) |
| `unset` | `inherit` if the property inherits, else `initial` |
| `revert` | Roll back to the previous origin (usually browser defaults) |
| `revert-layer` | Roll back to the previous cascade layer |

`all: unset` or `all: revert` resets every property on an element, handy for button resets.

## Debugging

- DevTools' Styles pane shows struck-through overridden declarations and which layer each rule belongs to.
- The Computed pane shows the final value and, expanded, where it came from.
- Invalid values are dropped at parse time (warning icon) and don't take part in the cascade, but an invalid custom-property substitution makes the property "invalid at computed-value time", resolving to `unset`.

## Common interview questions

**How is specificity calculated?**
Count IDs, then classes/attributes/pseudo-classes, then types/pseudo-elements, and compare those three numbers left to right. `:where()` adds nothing; `:is()`, `:not()` and `:has()` add their most specific argument.

**What beats an ID selector?**
An inline style, `!important`, a rule in a later cascade layer (if the ID rule is layered), or unlayered styles over layered ones. Another selector with more IDs also wins.

**Why avoid `!important`?**
It escalates into wars of more `!important`s. Use layers or lower-specificity base styles instead; reserve `!important` for utilities that must always win or for overriding third-party inline styles.

**What problem do cascade layers solve?**
They decouple priority from specificity and source order, so a reset, a component library and utilities can coexist with predictable precedence.

**`initial` vs `unset` vs `revert`?**
`initial` uses the spec default (often not what browsers show, e.g. `display: inline` for a `div`). `unset` inherits if inheritable, else initial. `revert` goes back to the browser's stylesheet value.

**Does order of classes in the HTML matter?**
No. `class="a b"` and `class="b a"` are identical; only stylesheet order and specificity matter.

## Pitfalls

- Using IDs for styling and then fighting specificity everywhere.
- Long descendant chains like `.page .content .list .item a` that are hard to override and fragile to markup changes.
- Assuming unlayered vendor CSS can be beaten from inside a layer.
- Forgetting that `:is(#id, .class)` gives ID-level specificity to the class branch too.
