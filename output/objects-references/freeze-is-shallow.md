---
title: Object.freeze is shallow
difficulty: Medium
order: 3
tags: [references, freeze, strict-mode]
frequency: medium
expected: |
  80 b 2
  true false
  TypeError
---

```js
const config = Object.freeze({ port: 80, db: { host: 'a' }, list: [1] })

config.port = 8080
config.db.host = 'b'
config.list.push(2)
delete config.port

console.log(config.port, config.db.host, config.list.length)
console.log(Object.isFrozen(config), Object.isFrozen(config.db))

function strictWrite() {
  'use strict'
  try {
    config.port = 1
  } catch (e) {
    console.log(e.name)
  }
}
strictWrite()
```

## Explanation

1. The snippet runs in sloppy mode, so writing to or deleting a frozen property **fails silently**. `port` stays `80`.
2. `freeze` only locks `config`'s own properties. `config.db` and `config.list` still point to ordinary, unfrozen objects, so changing `host` and pushing onto `list` both work: `80 b 2`.
3. `config` is frozen; `config.db` is not.
4. In strict mode, the same failed write throws a `TypeError` instead of failing silently.

Rule to remember: `freeze` is one level deep (recurse for a deep freeze), and failed writes are silent unless the code is strict.
