---
title: Java for JavaScript Developers
order: 1
summary: The mental-model shift — static types, compilation, the JVM, classes everywhere, checked exceptions — plus a side-by-side table for the twenty things you reach for daily.
---

Interviewers can tell within minutes whether you think in Java or are translating from JavaScript in your head. The language is not hard; what trips people up is a handful of assumptions that quietly stop being true. This article is the list of those assumptions.

## What actually changes

| Assumption from JS | Java reality |
|---|---|
| Types are checked at runtime, if at all | Types are checked at compile time; a type error is a build failure, not a bug report |
| Code runs from source | `javac` compiles `.java` to `.class` bytecode; the JVM loads, verifies and JIT-compiles it |
| Functions are values and live anywhere | Every function is a method on a class or interface; lambdas are objects implementing an interface |
| Objects are bags of properties with a prototype chain | Objects are instances of a fixed class; fields and methods are declared, not added at runtime |
| `==` and `===` compare values (mostly) | `==` compares references for objects and values for primitives; `equals()` compares content |
| Errors are thrown and maybe caught | Checked exceptions must be declared or handled, or the code will not compile |
| One global namespace per module file | Packages map to directories; `import` brings a type into scope, nothing is executed on import |
| `null`/`undefined` both exist | Only `null`; there is no `undefined`, and dereferencing `null` throws `NullPointerException` |
| Numbers are all doubles | `int`, `long`, `double`, `boolean`, `char`… with fixed sizes and silent integer overflow |
| Single-threaded with an event loop | Many OS threads; shared memory; concurrency bugs are real and asked about |

## Compilation and the JVM in one minute

```text
Hello.java --javac--> Hello.class (bytecode) --java--> JVM: class loader -> verifier -> interpreter -> JIT (C1/C2)
```

- Bytecode is portable; the JVM is platform-specific. "Write once, run anywhere" means the bytecode, not the binary.
- The JIT compiles hot methods to native code after profiling. Warm-up is why Java benchmarks look slow for the first seconds.
- Garbage collection is automatic. You do not free memory; you avoid holding references longer than needed.
- `java Hello.java` (since 11) compiles and runs a single file in one step; JEP 458 (Java 22) extends that to multiple files. Good for scratch work, not builds.

## Classes everywhere

There are no free-standing functions or top-level variables. The closest thing is a `static` method on a class:

```java
package com.example.util;

public final class Strings {
    private Strings() {}                       // utility class: no instances

    public static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
```

- One public top-level class per file, and the file name must match it (`Strings.java`).
- `static` members belong to the class, not an instance; `Strings.isBlank(x)` with no `new`.
- `final` on a class means no subclasses; on a method, no overriding; on a variable, assign once.

The entry point is a `static` method named `main`:

```java
public class App {
    public static void main(String[] args) {
        System.out.println("args: " + String.join(",", args));
    }
}
```

Java 21 previews `void main()` without `static` or a class (JEP 445); Java 25 finalises it. Know it exists, write the classic form.

## No prototypes, no `this` surprises

`this` is always the current instance. It cannot be rebound, there is no `call`/`apply`/`bind`, and a method reference `obj::method` captures the receiver at creation time. Inside a lambda, `this` still means the enclosing instance, not the lambda — the opposite of a JS `function` expression and the same as an arrow function.

Inheritance is declared, single for classes, multiple for interfaces:

```java
interface Shape { double area(); }
record Circle(double r) implements Shape { public double area() { return Math.PI * r * r; } }
```

There is no way to add a method to an existing class at runtime. Extension happens through composition, subclassing, or static helper methods.

## Static typing you will actually use

```java
int count = 0;                 // primitive, 32-bit, cannot be null
Integer boxed = null;          // wrapper object, can be null
String name = "x";             // reference type, immutable
List<String> names = new ArrayList<>();   // generic; the diamond infers <String>
var map = new HashMap<String, List<Integer>>(); // var = local type inference only
```

`var` versus `let`: `var` only infers a type from the initializer and that type is then fixed; it is not dynamic, not reassignable to another type, allowed only for local variables with an initializer, never for fields, parameters or `null`. Reassignment is allowed, so `var` is closer to a typed `let` than to `const`. For a constant you write `final var` or, more commonly, just `final int`.

### Primitives versus references

Eight primitives: `byte short int long float double char boolean`. Everything else is a reference. Consequences:

- Collections only hold references, so `List<int>` is illegal; you write `List<Integer>` and pay for boxing.
- `int` overflows silently: `Integer.MAX_VALUE + 1` is `Integer.MIN_VALUE`. Use `Math.addExact` or `long` when it matters.
- Integer division truncates: `7 / 2` is `3`; `7 / 2.0` is `3.5`.
- `char` is a 16-bit UTF-16 code unit, so `"😀".length()` is `2`.

## Checked exceptions

A method must declare the checked exceptions it can throw, and callers must handle or re-declare them:

```java
public String read(Path p) throws IOException {
    return Files.readString(p);
}
```

`RuntimeException` and its subclasses (`NullPointerException`, `IllegalArgumentException`, `IllegalStateException`) are unchecked and need no declaration. Modern code throws unchecked exceptions for programming errors and wraps checked I/O exceptions at boundaries. Details in the exceptions article.

## Packages, imports and modules

```java
package com.acme.billing;           // must be the first statement; maps to com/acme/billing/

import java.util.List;              // one type
import java.util.*;                 // every type in the package (not sub-packages)
import static java.util.Map.entry;  // a static member, usable as entry(k, v)
```

- `java.lang` (`String`, `Math`, `System`, `Integer`) is imported automatically.
- Imports are compile-time only. Nothing runs when you import; there is no equivalent of a module's side effects.
- Package-private (no modifier) is the default visibility: visible within the same package only.
- Modules (`module-info.java`, Java 9+) add a layer above packages for encapsulating a library's internals. Most application code ignores them and runs on the classpath; be able to say that.

## Memory model in brief

- Local variables and primitives live on the thread's stack; every object lives on the heap and is reached through references.
- Passing an object to a method copies the reference ("pass by value of the reference"). The method can mutate the object but cannot make the caller's variable point elsewhere — identical to JS.
- `String` is immutable and `final`; concatenation creates new objects. `StringBuilder` for loops.

## Daily-use translation table

| You want | JavaScript | Java 21 |
|---|---|---|
| Print | `console.log(x)` | `System.out.println(x)` |
| Constant | `const N = 3` | `static final int N = 3;` |
| String interpolation | `` `${a} and ${b}` `` | `a + " and " + b` or `"%s and %s".formatted(a, b)` |
| Multi-line string | template literal | text block `"""..."""` |
| Array literal | `[1, 2, 3]` | `new int[]{1, 2, 3}` or `List.of(1, 2, 3)` |
| Growable list | `[]` + `push` | `new ArrayList<>()` + `add` |
| Map | `new Map()` / object | `new HashMap<>()`, `Map.of(k, v)` for a fixed one |
| Set | `new Set()` | `new HashSet<>()` |
| Iterate | `for (const x of xs)` | `for (var x : xs)` |
| Map/filter/reduce | array methods | `xs.stream().map(..).filter(..).toList()` |
| Arrow function | `(a, b) => a + b` | `(a, b) -> a + b` typed as `BinaryOperator<Integer>` |
| Optional chaining | `a?.b?.c` | `Optional.ofNullable(a).map(A::b).map(B::c)` or explicit null checks |
| Nullish default | `x ?? d` | `x != null ? x : d` or `Objects.requireNonNullElse(x, d)` |
| Destructuring | `const {a, b} = o` | record patterns: `if (o instanceof Point(var a, var b))` |
| Object literal | `{ name, age }` | `record Person(String name, int age)` |
| Class | `class A extends B` | `class A extends B` (one superclass) + `implements I, J` |
| Equality | `a === b` | `a.equals(b)` for objects; `==` only for primitives and identity |
| Spread/copy | `[...xs]`, `{...o}` | `new ArrayList<>(xs)`, `List.copyOf(xs)`, record `with`-style copy by hand |
| Try/catch | `try {} catch (e) {}` | `try {} catch (IOException e) {}` — typed, multiple clauses |
| Async | `async`/`await`, promises | threads, `CompletableFuture`, virtual threads (21) |
| JSON | `JSON.parse` built in | Jackson or Gson library |
| Package manager | npm, `package.json` | Maven `pom.xml` or Gradle `build.gradle.kts` |
| Run tests | Jest, Vitest | JUnit 5 via `mvn test` / `gradle test` |
| REPL | node | `jshell` |

## Reading Java like a Java engineer

Idioms that signal fluency in an interview:

- Program to the interface: `List<String> xs = new ArrayList<>();`, never `ArrayList<String> xs`.
- Favour immutability: `final` fields, records, `List.of`, `List.copyOf`.
- Return empty collections, not `null`; return `Optional` only for "may be absent" single values.
- Keep `equals`, `hashCode` and `toString` consistent (records give them for free).
- Prefer `for-each` or streams over index loops unless you need the index.
- Name constants `UPPER_SNAKE`, types `PascalCase`, everything else `camelCase`, packages lowercase.

## Common interview questions

**Why is Java called "compile once, run anywhere"?**
`javac` produces bytecode rather than machine code. Any JVM that implements the spec can load and run that bytecode, with the JIT producing native code for the host at runtime. The portability is in the bytecode; the JVM itself is platform-specific.

**Is Java pass-by-value or pass-by-reference?**
Strictly pass-by-value. For objects the value is the reference, so a method can mutate the object it receives but cannot reassign the caller's variable. This is exactly how JavaScript behaves, which is a useful thing to say.

**What is the difference between JDK, JRE and JVM?**
The JVM executes bytecode. The JRE is the JVM plus the standard library, enough to run programs. The JDK adds the compiler and tools (`javac`, `jshell`, `jar`, `jlink`). Since Java 11 Oracle ships only the JDK.

**What does `var` do and when would you avoid it?**
It infers a local variable's static type from the initializer; the type does not change afterwards. Avoid it when the right-hand side does not make the type obvious (`var result = service.process(x)`) or when you want a wider interface type than the concrete one you are constructing.

**How does `this` differ from JavaScript?**
It is always the current instance, fixed at call time, with no rebinding. Inside a lambda `this` still refers to the enclosing object. There is nothing like `bind` because there are no detached functions; a method reference captures its receiver.

**What is a `static` method and when would you use one?**
A method that belongs to the class rather than an instance, callable without `new`. Use it for pure utilities and factory methods. It cannot be overridden or access instance state, which makes it hard to mock — a reason to use them sparingly in service code.

**Where do checked exceptions come from and are they a good idea?**
They are part of a method's signature so callers are forced to acknowledge recoverable failures like I/O. In practice they fight lambdas and streams, so most modern codebases use unchecked exceptions and translate at boundaries. Acknowledge both sides.

**What is `NullPointerException` and how do you avoid it?**
Dereferencing a `null` reference. Avoid it by not returning `null` (empty collections, `Optional`), validating inputs with `Objects.requireNonNull`, using records with non-null invariants, and reading the helpful NPE messages Java 14+ prints that name the exact variable.

## Pitfalls

- Comparing strings with `==` out of JavaScript habit.
- Expecting closures to capture mutable locals: Java lambdas only capture effectively final variables.
- Treating `null` like `undefined`: there is one "no value", and calling a method on it throws `NullPointerException`.
- Assuming integer division behaves like JavaScript numbers: `7 / 2` is `3` for `int`s.
- Writing everything as static utility methods instead of small classes with clear responsibilities.

## Key takeaways

- Java is compiled to bytecode and statically typed; most JavaScript runtime errors become compile errors.
- Everything lives in classes; use records for data, interfaces for behaviour, and composition over inheritance.
- `equals`/`hashCode` replace JavaScript's reference-or-value intuitions for objects.
- Checked exceptions are part of method signatures.
- Collections, streams and `Optional` map closely to JavaScript arrays, iterator helpers and `?.`/`??`, with types.
