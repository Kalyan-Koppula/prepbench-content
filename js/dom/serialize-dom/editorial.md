**Key insight:** a DOM tree is already a tree of nodes; serializing it is a recursive map where `nodeType` decides the shape. Elements recurse, text becomes a string, everything else disappears.

## Approach

1. `null`/`undefined` → `null`. Text (`nodeType === 3`) → `textContent`. Any other non-element → `null`.
2. For an element, copy `element.attributes` into a plain object (`attr.name → attr.value`).
3. Walk `childNodes`, skip whitespace-only text, serialize the rest and keep the non-null results.
4. Return `{ tag: tagName.toLowerCase(), attributes, children }`.

## Pitfalls

- Using `children` instead of `childNodes` silently loses all the text.
- Using `innerHTML` or `outerHTML` for text keeps entities like `&amp;`; `textContent` gives the decoded text.
- Trimming every text node changes meaning: `Hello <em>big</em>` needs the trailing space.
- Copying only a known set of attributes (`id`, `class`) misses `data-*`, ARIA and boolean attributes like `required`.
- Storing the DOM node or `el.style` in the result breaks `JSON.stringify`.

## Follow-ups interviewers add

- **Deserialize:** write `deserialize(json)` that rebuilds real DOM nodes, so `deserialize(serialize(el)).isEqualNode(el)` holds (apart from dropped whitespace and comments).
- **Form state:** `input.value`, `checked` and `selected` live in properties, not attributes. How would you capture them?
- **Huge trees:** make it iterative, or stream it, so a 100k-node page doesn't blow the stack.
- **Compact format:** encode elements as tuples `[tag, attrs, ...children]` to shrink the payload.
