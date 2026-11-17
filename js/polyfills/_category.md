---
title: Polyfills
order: 3
summary: Rebuild call, apply, bind, the array workhorses, Object helpers, new, instanceof and JSON.stringify from scratch. Prototype methods are written as plain `myX` functions that read their receiver from `this`; the tests install them (e.g. as `Array.prototype.myMap`) and call them as methods, so the real built-ins are never overridden.
---

How these questions work:

- **Prototype methods** (`myCall`, `myApply`, `myBind`, `myMap`, `myFilter`, `myReduce`, `myFlat`) are declared as a plain `function myMap(callback, thisArg) { … }` that reads the array (or function) from `this`, exactly like the real method. The tests install it with `Object.defineProperty(Array.prototype, 'myMap', { value: myMap, … })` and call `[1, 2].myMap(fn)`.
- **Static functions and operators** (`arrayFrom`, `objectCreate`, `myNew`, `myInstanceof`, `objectAssign`, `objectIs`, `jsonStringify`) take everything as arguments.
- Don't call the built-in you are replacing. One test in each question temporarily removes it to check.
