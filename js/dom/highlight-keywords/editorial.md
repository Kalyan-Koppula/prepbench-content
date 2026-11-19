**Key insight:** highlighting is a text-node operation. Find the text nodes, split each one around its matches, and replace it with a fragment of text pieces and `<mark>` elements. Never round-trip through `innerHTML`.

## Approach

1. Drop empty keywords, sort the rest longest first, escape regex characters and join them into one `gi` regex. Alternation tries options left to right, so longest-first gives "longest wins at the same position".
2. Recursively collect text nodes under `root`, not descending into `MARK`, `SCRIPT` or `STYLE`. Collect before mutating.
3. For each text node, run `matchAll`. Build a `DocumentFragment` with the text before each match, a `<mark>` holding the matched text, and the remainder.
4. If anything matched, `replaceChild(fragment, textNode)` and add the matches to the count.

## Walkthrough

`highlight(root, ['java', 'javascript'])` on `<p>I like JavaScript and <b>java</b>.</p>`:

| Step | Result |
| --- | --- |
| Sort keywords longest first | `['javascript', 'java']`, so "JavaScript" isn't split into "Java" + "Script" |
| Build one case-insensitive regex | `/javascript|java/gi` (special characters escaped) |
| Collect text nodes, skipping `MARK`, `SCRIPT`, `STYLE` | "I like JavaScript and ", "java", "." |
| Replace each text node with a fragment of text and `<mark>` elements | `I like <mark>JavaScript</mark> and <b><mark>java</mark></b>.` |

Working on **text nodes** keeps existing elements and event listeners intact, unlike rebuilding `innerHTML`, which would also risk XSS with user text.

## Complexity

`O(total text length)` plus node creation.

## Edge cases to test

- Overlapping keywords (longest wins).
- Case-insensitive matches keep the original casing.
- Keywords with regex characters (`c++`, `a.b`).
- Text inside nested elements.
- Running twice doesn't nest `<mark>` elements.
- Returns the number of highlights.

## Pitfalls

- `root.innerHTML = root.innerHTML.replace(/cat/gi, …)` rewrites attributes (`title="<mark>cat</mark>"`), breaks entities (`&lt;` contains `lt`), and recreates every element, dropping listeners and references.
- Unescaped keywords: `c++` throws "nothing to repeat", `.net` matches `anet`.
- Short keyword first in the alternation: `java|javascript` marks only `Java` inside `JavaScript`.
- Mutating while walking `childNodes` (a live list) skips or revisits nodes.
- Putting the matched text into the mark with `innerHTML` reintroduces the markup bug.

## Follow-ups interviewers add

- **Whole words only:** add `\b` boundaries; then ask about Unicode (`\b` is ASCII-only, use `\p{L}` with the `u` flag).
- **Matches across elements:** highlight `JavaScript` in `<b>Java</b>Script`. Concatenate the text of a block, match, then map offsets back to nodes, splitting marks per node.
- **Un-highlight:** replace each `<mark>` with its text and call `normalize()` to merge adjacent text nodes.
- **Large documents:** use a `TreeWalker` with `SHOW_TEXT`, and the CSS Custom Highlight API to highlight without touching the DOM at all.

## In the interview

The two key decisions are text-node processing (safety, preserving listeners) and longest-first alternation. Mention the CSS Custom Highlight API as a newer way to highlight ranges without changing the DOM.
