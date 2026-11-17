**Key insight:** parse first, compare second. Once each version is `{ core: [major, minor, patch], pre: [...] }`, the precedence rules are four short, ordered checks, and none of them involve string comparison of the core numbers.

## Approach

1. **Parse:** trim, strip a leading `v`, cut at `+`, split at the *first* `-` into core and pre-release. Core is `split('.').map(Number)` padded to three numbers; pre-release is `split('.')` or `[]`.
2. **Core:** compare the three numbers; the first difference decides.
3. **Release vs pre-release:** if exactly one has a pre-release, that one is lower.
4. **Pre-release:** walk identifiers. The side that runs out first is lower; two numerics compare numerically; numeric beats text by being lower; text compares with `<`.

## Pitfalls

- Comparing `'1.10.0' > '1.9.0'` as strings (false) or splitting on `.` and comparing segments as strings.
- `localeCompare` for text identifiers: it is case-insensitive-ish and locale-dependent, so `'Beta'` vs `'alpha'` comes out the wrong way.
- Splitting on every `-`, which breaks pre-releases like `x-y.1`.
- Returning `a - b` style arbitrary numbers when the caller asked for exactly `-1 | 0 | 1`.
- Treating `1.0.0-rc.1` as greater than `1.0.0` because it is "longer".

## Follow-ups interviewers add

- **Ranges:** `satisfies('1.4.2', '^1.2.0')`, and how `^` and `~` differ for `0.x` versions.
- **Validation:** reject leading zeros (`01.2.3`) and empty identifiers, as the spec requires.
- **Max satisfying:** pick the highest version in a list that matches a range (what package managers do).
