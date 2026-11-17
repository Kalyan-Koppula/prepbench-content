**Key insight:** normalise both sides into arrays of non-empty segments first. After that, matching is a single loop over the pattern where each segment type has a one-line rule, plus one final length check.

## Approach

1. `path.split(/[?#]/)[0]` drops the query and hash. Split both strings on `/` and `filter(Boolean)`.
2. For pattern segment `i`, with `value = pathParts[i]`:
   - `*`: capture `pathParts.slice(i)`, decode each part, join with `/`, and return immediately.
   - `:name?`: if `value` is missing, skip; otherwise capture it.
   - `:name`: if `value` is missing, return `null`; otherwise capture `decodeURIComponent(value)`.
   - static: return `null` unless `part === value`.
3. After the loop, return `null` if the path has more segments than the pattern consumed.
4. Wrap decoding in `try/catch`; a `URIError` means no match.

## Pitfalls

- Building a regex from the pattern without escaping regex characters: `/v1.0/:id` then matches `/v100/…`.
- Decoding the whole path before splitting, so an encoded `%2F` inside a param splits into two segments.
- Forgetting the final length check: `/users/:id` would match `/users/1/delete`.
- Setting `params.postId = undefined` for an absent optional param; `Object.keys` and `in` checks then disagree with the statement.

## Follow-ups interviewers add

- **Route ranking:** given many routes, pick the most specific (static beats param beats wildcard), as React Router does.
- **Compile once:** turn each pattern into a matcher function or regex for speed.
- **Reverse routing:** `buildPath('/users/:id', { id: 7 })`, with encoding.
- **Constraints:** `:id(\d+)` style params that must match a regex.
