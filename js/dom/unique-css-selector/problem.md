---
title: Unique CSS Selector
difficulty: Medium
order: 9
tags: [dom, css-selectors, traversal]
frequency: medium
exports: [getUniqueSelector]
dom: true
hints:
  - Build the selector bottom-up, one step per element, joining steps with ` > `.
  - "A step is `#id` if the element has one; otherwise its tag, plus `:nth-child(n)` only when a sibling element has the same tag. `n` counts all element siblings, not just same-tag ones."
  - After adding each step, ask the document whether the selector so far matches exactly one element. Stop as soon as it does, or when you add an `#id` step.
---

Testing tools and analytics scripts need to point at "this exact element" in a way that survives a page reload. Implement `getUniqueSelector(el)`, which returns a CSS selector that matches `el` and nothing else in its document.

Build the selector from `el` upward, one **step** per element:

1. If the element has an `id`, the step is `#id`, and the selector is finished.
2. Otherwise the step is the lower-case tag name. If any sibling **element** has the same tag, add `:nth-child(n)`, where `n` is the element's 1-based position among all of its parent's element children.
3. Prepend each new step with ` > ` (`ul:nth-child(2) > li`). After each step, if the selector matches exactly one element in the document, stop. Otherwise continue with the parent.

```js
document.body.innerHTML = `
  <main>
    <ul><li>Milk</li><li>Eggs</li></ul>
    <ul><li>Bread</li></ul>
  </main>
  <footer id="contact"><p>Email us</p><a>Call</a></footer>`

const [milk, eggs, bread] = document.querySelectorAll('li')
getUniqueSelector(eggs)  // 'li:nth-child(2)'
getUniqueSelector(milk)  // 'ul:nth-child(1) > li:nth-child(1)'
getUniqueSelector(bread) // 'ul:nth-child(2) > li'
getUniqueSelector(document.querySelector('a')) // 'a'
```

## Notes

- Never use classes: they change too often to be a stable anchor.
- Ids in the tests are unique and are valid CSS identifiers, so `#id` can be used as is.
- `nth-child` counts elements only; text and comment nodes don't affect `n`.
- `document.querySelectorAll` is allowed for the "is it unique yet?" check. Use `el.ownerDocument`.
- `document.body` comes out as `'body'`.
