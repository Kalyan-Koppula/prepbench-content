**Key insight:** events bubble, so a single listener on the container sees every click inside it. `event.target.closest(selector)` turns "what was clicked" into "which row was clicked".

## Approach

1. Create a `listener` closure and add it to `root` for `type`.
2. In the listener, take `event.target` (or its parent if it's a text node) and call `closest(selector)`.
3. Reject the match if it's missing, if it is `root`, or if `root` doesn't contain it. That happens when the selector matches an ancestor of `root`.
4. Call `handler.call(match, event, match)`.
5. Return `() => root.removeEventListener(type, listener)`. Because `listener` is a fresh function per call, two subscriptions with the same handler stay independent.

## Walkthrough

`delegate(list, 'li[data-id]', 'click', handler)` and the user clicks the `<span>` inside `<li data-id="7"><span>Buy milk</span></li>`:

| Step | Value |
| --- | --- |
| `event.target` | the span (or a text node in some cases) |
| start element | the span (text nodes start from their parent element) |
| `closest('li[data-id]')` | the li |
| checks | the li isn't the root and is inside the root |
| handler call | `this` = li, second argument = li |

The listener lives on the list, so items added later are handled automatically, and one listener replaces hundreds.

## Complexity

`O(depth)` per event for the `closest` walk.

## Edge cases to test

- Clicks on nested children of the target.
- Items added after setup.
- Matches outside the root are ignored.
- The returned function removes the listener.
- Events whose target is a text node.

## Pitfalls

- Checking `event.target.matches(selector)` misses clicks on children of the row (the `<span>` inside the `<li>`).
- Forgetting the `root.contains(match)` check: `closest` keeps climbing past `root` up to `<html>`.
- Calling `removeEventListener(type, handler)` in `unsubscribe`: the user's handler was never registered, your wrapper was.
- Using an arrow function as the handler and expecting `this`: that's the caller's choice, but you must still pass the match as `this` with `call`.
- Walking up and calling the handler for *every* matching ancestor (jQuery does this). Interviewers usually want the nearest match only; ask.

## Follow-ups interviewers add

- **Non-bubbling events:** `focus`, `blur`, `mouseenter` don't bubble. Use `focusin`/`focusout`, or listen in the capture phase (`addEventListener(type, fn, true)`).
- **`stopPropagation`:** what if a child calls it before the event reaches `root`?
- **Multiple handlers per root:** keep one native listener per event type and a list of `{ selector, handler }` entries, like jQuery's `.on()`.
- **Shadow DOM:** `event.target` is retargeted at the shadow host; use `event.composedPath()` to find the real origin.
- **Performance:** why is delegation faster to set up for 10k rows, and when is it slower (`closest` on every event)?

## In the interview

Explain bubbling, then the `closest` + `contains` checks. Mention non-bubbling events (`focus`, `mouseenter`) and their bubbling counterparts.
