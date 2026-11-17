---
title: Highlight Keywords
difficulty: Medium
order: 10
tags: [dom, text-nodes, regex]
frequency: medium
exports: [highlight]
dom: true
hints:
  - Work on text nodes, never on `innerHTML`. Collect the text nodes first, then change them, so you don't walk into marks you just created.
  - Build one case-insensitive regex from all keywords. Escape regex characters, and put longer keywords first so `javascript` wins over `java`.
  - "For each text node with matches, build a `DocumentFragment` of plain text pieces and `<mark>` elements, then swap it in with `replaceChild`."
---

A search page wants to highlight what the user typed. Implement `highlight(root, keywords)`: wrap every occurrence of any keyword in the text under `root` in a `<mark>` element, and return how many `<mark>` elements you created.

```js
document.body.innerHTML = `
  <article id="post">
    <h2>JavaScript tips</h2>
    <p>Learn <a href="/java" title="Java">Java</a> and javascript.</p>
  </article>`

highlight(document.getElementById('post'), ['java', 'javascript']) // 3
// <h2><mark>JavaScript</mark> tips</h2>
// <p>Learn <a href="/java" title="Java"><mark>Java</mark></a> and <mark>javascript</mark>.</p>
```

## Notes

- Matching ignores case, but the `<mark>` keeps the original text.
- Only text is searched. Tag names, attribute values and anything inside `<script>` or `<style>` are left alone.
- Keywords are literal text, not regular expressions (`c++` matches the three characters `c++`).
- When several keywords match at the same position, the longest one wins. Matches never overlap and are found left to right.
- Text already inside a `<mark>` is not highlighted again, so calling `highlight` twice changes nothing the second time.
- Existing elements must stay the same nodes (listeners and references on them keep working). Empty keywords are ignored; with no usable keywords, return `0`.
