**Key insight:** rendering is a recursive switch on the shape of the input. Primitive → text node, object → element, and the only real decisions are how each prop maps onto the DOM.

## Approach

1. If the vnode is a string or number, return `document.createTextNode(String(vnode))`.
2. Otherwise `document.createElement(type)`, then loop over `props`:
   - skip `false`, `null`, `undefined`;
   - `className` → `setAttribute('class', …)`;
   - `style` object → `Object.assign(el.style, style)`;
   - `/^on[A-Z]/` with a function → `addEventListener(name.slice(2).toLowerCase(), fn)`;
   - `true` → `setAttribute(name, '')`, anything else → `setAttribute(name, String(value))`.
3. Walk `children` with a recursive `append` that flattens arrays, skips `null`/`undefined`/booleans and appends `render(child)`.

## Walkthrough

`render({ type: 'button', props: { className: 'primary', disabled: true, onClick: save }, children: ['Save ', count] })`:

| Prop or child | Handling | DOM result |
| --- | --- | --- |
| `className` | mapped to the `class` attribute | `class="primary"` |
| `disabled: true` | boolean true → empty attribute | `disabled=""` |
| `onClick` | function prop starting with `on` | `addEventListener('click', save)` |
| `'Save '`, `count` | strings and numbers become text nodes | `Save 3` |

`false`, `null` and `undefined` props are skipped, and the same values as children render nothing, which makes conditional rendering (`cond && vnode`) work.

## Complexity

`O(n)` for `n` virtual nodes.

## Edge cases to test

- Nested elements and mixed children.
- Nested child arrays are flattened.
- Boolean attributes, `style` objects, event handlers.
- `null`/`false` children skipped; `0` rendered.

## Pitfalls

- `setAttribute('className', …)` creates an attribute literally called `classname`. React's `className` exists because `class` is a reserved word in JS, not because the DOM uses it.
- `if (!child) continue` drops `0` and `''`; check for `null`, `undefined` and booleans explicitly.
- Building an HTML string and assigning `innerHTML` is an XSS hole and loses the event handlers.
- `el.setAttribute('onclick', fn)` stores the function's source as a string; it doesn't attach the function.
- `setAttribute('style', obj)` writes `[object Object]`.

## Follow-ups interviewers add

- **Properties vs attributes:** `value`, `checked` and `selected` should be set as properties so they reflect the current state, not the default.
- **Components:** support `type` being a function `(props) => vnode`.
- **Fragments:** a `type` of `Fragment` renders its children into a `DocumentFragment`.
- **SVG:** use `createElementNS` with the SVG namespace for `svg` and its descendants.
- **Updates:** given the old and new vnode, patch the DOM instead of re-rendering (see *Diff and Patch*).

## In the interview

Connect it to JSX: `<button className="primary">` compiles to a call that creates exactly this object. The follow-up is diffing two trees instead of re-rendering everything ([diff-and-patch](/frontend/js/diff-and-patch)).
