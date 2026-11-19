**Key insight:** clipboard writes are async and can fail for reasons outside your control, so treat `copy` like any other request: await it, catch everything, and drive a short-lived `copied` flag with a timer you clean up.

## Approach

State holds `{ copied, error }`. A ref holds the reset timer and another mirrors `resetAfter`. `copy` is a `useCallback` with no dependencies: clear any pending reset, throw if `navigator.clipboard?.writeText` is missing, `await writeText(text)`, then set `{ copied: true, error: undefined }`, schedule the reset and return `true`. The `catch` sets `{ copied: false, error }` and returns `false`, so callers never get a rejected promise. An unmount-only effect clears the timer.

## Walkthrough

```jsx
const { copied, error, copy } = useCopyToClipboard(1500)
<button onClick={() => copy(code)}>{copied ? 'Copied!' : 'Copy'}</button>
```

| Event | State |
| --- | --- |
| click | `copy` awaits `navigator.clipboard.writeText` |
| success | `copied: true`, a timer resets it after 1.5 s |
| click again within 1.5 s | the old timer is cleared and a new one starts |
| failure (permissions, insecure context) | `error` set, `copied: false`, returns `false` |
| unmount | timer cleared |

## What to test

- Success sets `copied` and resets after the delay.
- Repeated copies restart the timer.
- Errors are reported and `copy` resolves to `false`.
- Missing Clipboard API handled.
- No updates after unmount.

## Pitfalls

- Calling `navigator.clipboard.writeText` without checking it exists: on `http://` origins and in some embedded webviews `navigator.clipboard` is `undefined`, and the click handler throws.
- Setting `copied` to `true` *before* the promise resolves shows "Copied!" for a write that then fails.
- Not clearing the previous timer: a second click is reset early by the first click's timer.
- Letting `copy` reject. Most callers write `onClick={() => copy(v)}` and never catch it.
- `writeText` must run during a user gesture in some browsers (Safari); awaiting something else first can lose the gesture.

## Follow-ups

- Fallback for old browsers: a hidden `<textarea>`, `select()`, `document.execCommand('copy')`.
- Copy rich content (`navigator.clipboard.write` with a `ClipboardItem` for HTML or images).
- Read from the clipboard (`readText`), and how permissions differ for reading.

## In the interview

Mention that the Clipboard API needs a secure context and usually a user gesture, and announce "Copied" to screen readers with a live region, not only a visual change.
