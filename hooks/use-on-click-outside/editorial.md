**Key insight:** "outside" is a containment check at press time: listen on `document` and ask each referenced element whether it `contains(event.target)`.

## Approach

Keep `handler` and `refs` in refs (updated after every commit) so a single effect can subscribe once on mount. The listener normalises `refs` to an array, collects the `current` elements that exist, returns early if there are none or if any of them contains the target, and otherwise calls `saved.current(event)`. Register it for `mousedown` and `touchstart` on `document`, and remove both in the cleanup.

## Pitfalls

- Using `click` instead of `mousedown`: a text selection or drag that starts inside and ends outside fires `click` on the common ancestor and closes the menu unexpectedly.
- Comparing `event.target === ref.current` misses every click on a child element; use `contains`.
- Forgetting the trigger button: the outside handler closes the menu on mousedown, then the button's `click` re-opens it. Passing both refs fixes it.
- Calling the handler when the element isn't rendered (`ref.current` is `null` and `null.contains` throws, or "nothing contains it" counts as outside).
- Subscribing in an effect that depends on `handler`, which re-subscribes on every render when it's an inline arrow.

## Follow-ups

- Shadow DOM: use `event.composedPath().includes(el)` instead of `contains`.
- Ignore presses inside portals rendered elsewhere in the DOM (React portals bubble through React's tree, but `contains` follows the real DOM).
- Add an `enabled` flag so the listener is only attached while the menu is open.
