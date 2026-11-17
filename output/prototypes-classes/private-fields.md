---
title: Private fields and brand checks
difficulty: Medium
order: 9
tags: [classes, private-fields]
frequency: medium
expected: |
  5
  true false
  0 undefined
  true false
  TypeError
---

```js
class Account {
  #balance = 0
  static isAccount(obj) {
    return #balance in obj
  }
  deposit(n) {
    this.#balance += n
    return this.#balance
  }
}

const acc = new Account()
console.log(acc.deposit(5))
console.log(Account.isAccount(acc), Account.isAccount({ balance: 5 }))
console.log(Object.keys(acc).length, acc['#balance'])

const fake = Object.create(Account.prototype)
console.log(fake instanceof Account, Account.isAccount(fake))

try {
  fake.deposit(1)
} catch (e) {
  console.log(e.name)
}
```

## Explanation

A `#private` field is stored on the instance by the class constructor, invisible to property operations.

1. `deposit(5)` updates the field: `5`.
2. `#balance in obj` is a **brand check**: true only for objects the constructor actually ran on. A look-alike public `balance` doesn't count: `true false`.
3. Private fields aren't properties. `Object.keys` sees nothing, and the string key `'#balance'` is an unrelated (missing) public property: `0 undefined`.
4. `fake` is linked to `Account.prototype`, so `instanceof` says `true`, but the constructor never ran, so it has no `#balance`: `false`.
5. `fake.deposit(1)` finds the method, but reading `this.#balance` on an object without the field throws a `TypeError`.

Rule to remember: `instanceof` checks the prototype chain and can be fooled; `#field in obj` checks that the constructor really ran.
