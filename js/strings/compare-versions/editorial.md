**Key insight:** parse first, compare second. Once each version is `{ core: [major, minor, patch], pre: [...] }`, the precedence rules are four short, ordered checks, and none of them involve string comparison of the core numbers.

## Approach

1. **Parse:** trim, strip a leading `v`, cut at `+`, split at the *first* `-` into core and pre-release. Core is `split('.').map(Number)` padded to three numbers; pre-release is `split('.')` or `[]`.
2. **Core:** compare the three numbers; the first difference decides.
3. **Release vs pre-release:** if exactly one has a pre-release, that one is lower.
4. **Pre-release:** walk identifiers. The side that runs out first is lower; two numerics compare numerically; numeric beats text by being lower; text compares with `<`.

## Walkthrough

`compareVersions('1.2.0-beta.2', '1.2.0-beta.11')`:

| Step | Left | Right | Result |
| --- | --- | --- | --- |
| core | 1.2.0 | 1.2.0 | equal, continue |
| pre-release present on both | `beta.2` | `beta.11` | compare identifiers |
| `beta` vs `beta` | equal | | continue |
| `2` vs `11` | both numeric | compare as numbers | **−1** |

Numeric identifiers compare numerically (so `11 > 2`, unlike string comparison), a version **without** a pre-release is greater than the same core with one (`1.2.0 > 1.2.0-rc.1`), and build metadata after `+` is ignored.

## Complexity

`O(n)` in the length of the version strings.

## Edge cases to test

- Different core lengths (`1.2` equals `1.2.0`).
- Numeric versus lexical comparison (`1.10.0 > 1.9.0`).
- Pre-release versus release.
- Numeric versus alphanumeric identifiers (`alpha.1 < alpha.beta`).
- A leading `v` and build metadata.

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

## In the interview

Name semver precedence rules explicitly, especially pre-releases. Mention using it as a comparator: `versions.sort(compareVersions)`.
