---
title: ?? vs ||
difficulty: Easy
order: 14
tags: [nullish-coalescing, truthiness]
frequency: high
expected: |
  50 0
  Untitled ""
  light none
  false NaN z
---

```js
const settings = { volume: 0, title: '', theme: null }

console.log(settings.volume || 50, settings.volume ?? 50)
console.log(settings.title || 'Untitled', JSON.stringify(settings.title ?? 'Untitled'))
console.log(settings.theme ?? 'light', settings.missing ?? 'none')
console.log(false ?? 'x', NaN ?? 'y', NaN || 'z')
```

## Explanation

`a || b` falls back when `a` is **falsy**. `a ?? b` falls back only when `a` is **nullish** (`null` or `undefined`).

1. `0` is falsy, so `||` replaces a legitimate volume of zero with `50`. `??` keeps `0`.
2. Same with the empty string: `||` gives `Untitled`, `??` keeps `''` (shown via `JSON.stringify` as `""`).
3. `null` and a missing property (`undefined`) are nullish, so `??` falls back for both: `light none`.
4. `false` and `NaN` are falsy but not nullish, so `??` keeps them. `||` replaces `NaN` with `z`.

Rule to remember: use `??` for defaults whenever `0`, `''` or `false` are valid values.
