---
title: Compare semantic versions
difficulty: Medium
order: 6
tags: [strings, sorting, parsing]
frequency: medium
exports: [compareVersions]
hints:
  - Parse each version into three numbers plus a list of pre-release identifiers. Strip a leading `v` and everything from `+` first.
  - A version without a pre-release ranks above the same version with one.
  - Compare pre-release identifiers pairwise. Two numeric ones compare as numbers; a numeric one ranks below a text one; text compares by character codes. If one list runs out first, it ranks lower.
---

Implement `compareVersions(a, b)` following [Semantic Versioning](https://semver.org) precedence. Return `-1` if `a` is lower, `1` if `a` is higher and `0` if they have the same precedence. The function should work as a `sort` comparator.

A version looks like `MAJOR.MINOR.PATCH`, optionally followed by `-PRERELEASE` and/or `+BUILD`:

```js
compareVersions('1.10.0', '1.9.3')            // 1  (numbers, not strings)
compareVersions('3.0.0-beta.2', '3.0.0')      // -1 (pre-releases come first)
compareVersions('3.0.0-beta.2', '3.0.0-beta.11') // -1
compareVersions('v2.1', '2.1.0+sha.5114f85')  // 0
```

Rules:

1. Compare `MAJOR`, `MINOR`, `PATCH` numerically, in that order. A missing `MINOR` or `PATCH` counts as `0`. A leading `v` is ignored.
2. If those are equal, a version **with** a pre-release is lower than one without.
3. Two pre-releases are compared identifier by identifier (split on `.`):
   - both numeric (digits only): compare as numbers;
   - numeric vs non-numeric: the numeric identifier is lower;
   - both non-numeric: compare by character code (plain `<` / `>`, so `'Z' < 'a'`);
   - if every shared identifier is equal, the one with **fewer** identifiers is lower.
4. Build metadata (from `+` onwards) is ignored.

## Notes

- The pre-release is everything between the **first** `-` and the `+` (or the end), so it may itself contain hyphens: `1.0.0-x-y.1`.
- You can assume inputs are well formed.
