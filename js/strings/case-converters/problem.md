---
title: Case converters
difficulty: Medium
order: 7
tags: [strings, regex]
frequency: medium
exports: [toCamelCase, toPascalCase, toSnakeCase, toKebabCase]
hints:
  - Write one `splitWords(input)` and build all four converters on top of it.
  - Insert a separator between a lowercase letter or digit and an uppercase letter, and between an uppercase letter and an uppercase-then-lowercase pair (`XMLHttp` to `XML Http`).
  - Then split on any run of non-alphanumeric characters, drop empty pieces and lowercase everything.
---

Implement four converters that accept a string in **any** common style (camelCase, PascalCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, or words separated by spaces) and produce:

- `toCamelCase(s)`: `parseJsonBody`
- `toPascalCase(s)`: `ParseJsonBody`
- `toSnakeCase(s)`: `parse_json_body`
- `toKebabCase(s)`: `parse-json-body`

```js
toSnakeCase('XMLHttpRequest')     // 'xml_http_request'
toCamelCase('MAX_RETRY_COUNT')    // 'maxRetryCount'
toKebabCase('getHTTPResponseCode') // 'get-http-response-code'
toPascalCase('user id')           // 'UserId'
```

Splitting the input into words:

1. Any run of characters that are not ASCII letters or digits is a separator (`_`, `-`, spaces, dots, …). Leading and trailing separators produce no empty words.
2. A new word starts at an uppercase letter that follows a lowercase letter or a digit (`userName` gives `user` + `Name`, `html5Parser` gives `html5` + `Parser`).
3. In a run of uppercase letters, a new word starts at the last uppercase letter if a lowercase letter follows it (`XMLHttp` gives `XML` + `Http`; `userID` gives `user` + `ID`).
4. Digits stay attached to the letters before them (`version2Update` gives `version2` + `Update`).

Output: every word is lowercased. camelCase capitalises the first letter of every word except the first; PascalCase capitalises every word. Acronyms are **not** preserved: `userID` becomes `userId`.

## Notes

- An input with no letters or digits gives `''`.
