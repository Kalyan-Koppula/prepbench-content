---
title: Render a template
difficulty: Medium
order: 2
tags: [strings, regex, escaping, objects]
frequency: medium
exports: [renderTemplate]
hints:
  - One global regex with `replace` and a callback can handle both `{{{ … }}}` and `{{ … }}`; put the triple-brace alternative first.
  - Resolve a path by splitting on `.` and stepping through own properties only, returning `undefined` as soon as a step is missing.
  - Escape `&` first (or do everything in one pass with a lookup map), otherwise you escape your own entities.
---

Implement `renderTemplate(template, data)`, a tiny Mustache-style renderer.

- `{{ path }}` is replaced with the value at `path` in `data`, **HTML-escaped**.
- `{{{ path }}}` is replaced with the value **as is** (no escaping).
- A path is one or more names separated by dots (`user.address.city`); a name may be an array index (`items.0.title`). Names consist of letters, digits, `_` and `$`.
- Whitespace just inside the braces is optional: `{{name}}` and `{{  name  }}` are the same.

```js
renderTemplate('<p>Hi {{ user.name }}, you have {{ inbox.count }} new {{{ noun }}}</p>', {
  user: { name: 'Ana & Bo' },
  inbox: { count: 0 },
  noun: '<b>messages</b>',
})
// '<p>Hi Ana &amp; Bo, you have 0 new <b>messages</b></p>'
```

## Notes

- If any step of the path is missing, or the final value is `null` or `undefined`, render an empty string. Other values go through `String(value)`, so `0` and `false` render as `"0"` and `"false"`.
- Only **own** properties count: `{{ toString }}` renders as an empty string.
- Escaping replaces `&` `<` `>` `"` `'` with `&amp;` `&lt;` `&gt;` `&quot;` `&#39;`. The template text itself is never escaped.
- Anything that is not a valid placeholder (`{{ }}`, `{{ a b }}`, an unclosed `{{`) is left untouched.
