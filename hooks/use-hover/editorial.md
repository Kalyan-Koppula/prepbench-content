**Key insight:** the hook needs to know *when the element changes*, and a callback ref is the React primitive that tells you exactly that.

## Approach

Return a `useCallback` ref with no dependencies. React calls it with the DOM node after mounting and with `null` before removal (and with old `null`, then new node, when the element is swapped). Each call first runs the stored `detach` for the previous node, resets `hovered` to `false`, and if there is a new node attaches `mouseenter`/`mouseleave` listeners and stores a `detach` that removes them. A removed node never fires `mouseleave`, which is why the reset matters.

## Walkthrough

```jsx
const [ref, hovered] = useHover()
return <div ref={ref}>{hovered ? 'Release to drop' : 'Drag here'}</div>
```

Using a **callback ref** means the hook knows when the element mounts, unmounts or is replaced:

| Ref called with | Action |
| --- | --- |
| a new element | detach listeners from the old one (if any), attach `mouseenter`/`mouseleave` |
| `null` (unmount) | detach and reset `hovered` |

An object ref plus an effect would miss elements that appear later (conditional rendering), because effects don't re-run when `ref.current` changes.

## What to test

- `hovered` toggles on enter and leave.
- Swapping the element moves the listeners.
- Unmount detaches and resets.

## Pitfalls

- `const ref = useRef(); useEffect(() => { ref.current.addEventListener(...) }, [])`: misses elements that render later and keeps listening to a replaced element.
- `mouseover` / `mouseout` bubble from children, so moving across an inner `<img>` toggles the state back and forth.
- Forgetting to reset: the tooltip stays "hovered" after the card is removed and reappears stuck the next time.
- An unstable callback ref (no `useCallback`) is called with `null` and then the node on *every* render, re-attaching listeners each time.

## Follow-ups

- React 19 lets a callback ref return a cleanup function. Rewrite with that.
- Use `pointerenter`/`pointerleave` and ignore touch (`e.pointerType === 'touch'`), since touch devices have no hover.
- Add enter/leave delays (`useHover({ enterDelay: 200 })`) for tooltips.

## In the interview

Explain callback refs versus object refs. Mention that hover doesn't exist on touch devices, so UI that relies on it needs another path (and CSS `:hover` is often enough for pure styling).
