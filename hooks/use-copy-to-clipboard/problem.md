---
title: useCopyToClipboard
difficulty: Medium
order: 19
tags: [async, clipboard, timers, cleanup]
frequency: medium
hook: useCopyToClipboard
hints:
  - '`navigator.clipboard.writeText(text)` returns a promise. Await it inside try/catch, and check that `navigator.clipboard` exists first.'
  - Keep the reset timer id in a ref; clear it before starting a new one and in an unmount cleanup.
  - Wrap `copy` in `useCallback` and read `resetAfter` through a ref so it stays stable.
---

Implement `useCopyToClipboard(resetAfter = 2000)`. It returns `{ copy, copied, error }`.

`copy(text)` writes `text` with the async Clipboard API (`navigator.clipboard.writeText`) and returns a promise of `true` on success or `false` on failure. After a successful copy, `copied` is `true` for `resetAfter` ms (long enough to show "Copied!"), then goes back to `false`.

```jsx
function CopyButton({ value }) {
  const { copy, copied, error } = useCopyToClipboard(1500)
  return (
    <button onClick={() => copy(value)} title={error ? 'Copy failed' : undefined}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
```

Requirements:

- On failure (`writeText` rejects, e.g. permission denied, or `navigator.clipboard` doesn't exist on an insecure origin), `copy` resolves `false`, `copied` is `false` and `error` holds the error. `copy` never rejects.
- A successful copy clears any previous `error`.
- Copying again while `copied` is `true` restarts the `resetAfter` countdown.
- `copy` keeps the same identity across renders. The pending reset is cancelled on unmount.
