---
title: Escape and unescape HTML
difficulty: Easy
order: 8
tags: [strings, security, regex]
frequency: medium
exports: [escapeHtml, unescapeHtml]
hints:
  - Do each direction in a single `replace` pass with a callback, so nothing you produce gets processed again.
  - "For unescaping, one regex can match `&name;`, `&#123;` and `&#x1F;`; decide what to return inside the callback."
  - "`String.fromCodePoint` handles characters outside the Basic Multilingual Plane (like emoji); check the range before calling it."
---

Implement two functions without using the DOM.

**`escapeHtml(text)`** makes text safe to insert into HTML element content or a quoted attribute by replacing exactly these five characters:

| Character | Becomes |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

**`unescapeHtml(html)`** reverses entity references:

- the named entities `&amp;` `&lt;` `&gt;` `&quot;` `&apos;` (names are case-sensitive);
- decimal references like `&#169;` and hex references like `&#x1F600;` (the `x` may be upper or lower case).

```js
escapeHtml(`<a href="/q?x=1&y=2">Tom's</a>`)
// '&lt;a href=&quot;/q?x=1&amp;y=2&quot;&gt;Tom&#39;s&lt;/a&gt;'

unescapeHtml('5 &lt; 7 &amp;&amp; &#x1F600; &copy;')
// '5 < 7 && 😀 &copy;'
```

## Notes

- Decode in one pass: `&amp;lt;` becomes `&lt;`, not `<`.
- Leave anything else exactly as it is: other named entities (`&copy;`), references without a semicolon, malformed ones (`&#xZZ;`), and numeric references to invalid code points (0, surrogates `0xD800`–`0xDFFF`, or above `0x10FFFF`).
