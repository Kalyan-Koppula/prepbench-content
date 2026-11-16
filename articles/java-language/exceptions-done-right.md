---
title: Exceptions Done Right
order: 4
summary: Checked vs unchecked, the hierarchy, try-with-resources, custom exceptions, wrapping and translation, finally pitfalls, exceptions in lambdas, and what they actually cost.
---

Interviewers use exceptions to find out whether you understand error handling as API design. The questions are predictable: checked versus unchecked, `finally` ordering puzzles, try-with-resources, and "how would you design exceptions for this service".

## The hierarchy

```text
Throwable
├── Error                      JVM problems: OutOfMemoryError, StackOverflowError — do not catch
└── Exception
    ├── (checked)              IOException, SQLException, InterruptedException, TimeoutException
    └── RuntimeException       (unchecked) NullPointerException, IllegalArgumentException,
                               IllegalStateException, IndexOutOfBoundsException, ClassCastException,
                               ArithmeticException, UnsupportedOperationException, NumberFormatException
```

- Checked: anything extending `Exception` but not `RuntimeException`. The compiler forces callers to catch or declare.
- Unchecked: `RuntimeException` and `Error` subtypes. No declaration required.
- `catch (Exception e)` catches both kinds but not `Error`; `catch (Throwable t)` catches everything and is almost always wrong.

## Checked versus unchecked: the actual argument

Checked exceptions encode "this can fail in a way you should plan for" in the signature. That sounds good and was the original design. The problems in practice:

- They do not compose with lambdas: `Function<T, R>` cannot throw a checked exception, so every stream over I/O needs a wrapper.
- They leak implementation details: a `Repository` interface declaring `throws SQLException` is married to JDBC.
- Callers mostly cannot recover anyway, so the exception gets wrapped or swallowed.

The modern convention, which Spring follows: unchecked exceptions for almost everything, checked only where a caller realistically recovers (retrying a timeout, handling a missing file). Spring translates `SQLException` into its unchecked `DataAccessException` hierarchy for exactly these reasons.

Use the standard unchecked types before writing your own:

| Throw | When |
|---|---|
| `IllegalArgumentException` | A parameter value is wrong |
| `IllegalStateException` | The call is wrong for the object's current state |
| `NullPointerException` (via `Objects.requireNonNull`) | A required reference is null |
| `UnsupportedOperationException` | The operation is not implemented or allowed |
| `NoSuchElementException` | Nothing to return where something was expected |

## Custom exceptions

```java
public class OrderNotFoundException extends RuntimeException {
    private final String orderId;

    public OrderNotFoundException(String orderId) {
        super("order not found: " + orderId);
        this.orderId = orderId;
    }
    public String orderId() { return orderId; }
}
```

- Extend `RuntimeException` unless you have a concrete reason to force handling.
- Name ends in `Exception`; message is for humans, fields are for code. Do not make callers parse the message.
- Always provide a `(String message, Throwable cause)` constructor on a base exception so wrapping keeps the chain.
- One base exception per module (`BillingException`) with specific subclasses beats a flat list of twenty unrelated types.
- For an HTTP service: domain exceptions in the service layer, a single `@RestControllerAdvice` that maps them to status codes and a problem-details body. Controllers do not catch.

## Wrapping and translation

Wrap at layer boundaries, and always pass the cause:

```java
try {
    return mapper.readValue(json, Order.class);
} catch (JsonProcessingException e) {
    throw new InvalidPayloadException("bad order payload", e);
}
```

Losing the cause (`throw new X("failed")` inside a catch) is the single most common review comment on exception code. The stack trace prints `Caused by:` sections for the chain, which is how you find the real failure.

Catching and rethrowing the same exception just to log it produces duplicate log lines at every layer. Log where you handle, not where you pass through.

## try-with-resources

Anything implementing `AutoCloseable` can be declared in the `try` header; it is closed in reverse declaration order, even on exceptions:

```java
try (var in = Files.newBufferedReader(path);
     var out = Files.newBufferedWriter(target)) {
    in.transferTo(out);
}                                        // out closed, then in, always
```

- If both the body and `close()` throw, the body's exception propagates and the close exception is attached via `addSuppressed`. Pre-Java 7 `finally` blocks did the opposite and lost the original.
- Java 9+ allows an effectively final variable declared earlier: `try (existingConn) { ... }`.
- Use it for JDBC connections, streams, locks via a small adapter, `ExecutorService` (which is `AutoCloseable` since 19), and HTTP clients.

## `finally` puzzles

```java
static int f() {
    try { return 1; }
    finally { System.out.println("finally"); }   // prints, then returns 1
}

static int g() {
    try { throw new RuntimeException(); }
    finally { return 2; }                        // returns 2; the exception is silently discarded
}

static int h() {
    int x = 1;
    try { return x; }
    finally { x = 2; }                           // returns 1: the return value was already evaluated
}
```

Rules: `finally` runs after the `try`/`catch` body, before control leaves. A `return` or `throw` inside `finally` overrides whatever the try block was returning or throwing, so never do that. `System.exit` and a JVM crash are the only ways to skip it.

## Multi-catch and rethrow

```java
try {
    parse(input);
} catch (NumberFormatException | DateTimeParseException e) {   // e is effectively final
    throw new ValidationException("unparseable input", e);
}
```

Types in a multi-catch cannot be subclasses of each other. Catch order matters otherwise: a subclass after its superclass is a compile error ("already caught").

Precise rethrow (Java 7): `catch (Exception e) { throw e; }` compiles even in a method declaring only the specific checked types the try block can throw, because the compiler tracks what `e` can actually be.

## Exceptions in lambdas and streams

Functional interfaces in `java.util.function` declare no checked exceptions. Three options:

```java
// 1. Wrap at the lambda
List<String> contents = paths.stream()
    .map(p -> {
        try { return Files.readString(p); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    })
    .toList();

// 2. A helper that converts a throwing function
@FunctionalInterface
interface ThrowingFunction<T, R> { R apply(T t) throws Exception; }

static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
    return t -> {
        try { return f.apply(t); }
        catch (RuntimeException e) { throw e; }
        catch (Exception e) { throw new RuntimeException(e); }
    };
}

// 3. Don't use a stream for I/O; a plain loop declares `throws IOException` naturally
```

`UncheckedIOException` exists in the JDK for exactly this. In streams, an exception from one element aborts the whole pipeline; collect `Result`-style records if you need partial success.

## Cost

Creating an exception is expensive because the constructor calls `fillInStackTrace()`, which walks the stack. Throwing and catching within the same method is cheap; unwinding deep stacks and printing traces is not. Consequences:

- Never use exceptions for control flow (parsing with `NumberFormatException` in a hot loop, breaking out of a stream).
- Pre-allocated or stack-trace-free exceptions (`super(msg, null, false, false)` to disable the trace) are a legitimate optimisation in libraries, not in application code.
- The JIT may elide stack traces for hot implicit exceptions like `NullPointerException` (`-XX:-OmitStackTraceInFastThrow` to turn that off when debugging a trace-less NPE in production).

## Reading a stack trace

```text
Exception in thread "main" java.lang.IllegalStateException: no tenant
    at com.acme.TenantContext.require(TenantContext.java:42)      <- where it was thrown
    at com.acme.OrderService.place(OrderService.java:88)          <- caller
    at com.acme.OrderController.post(OrderController.java:31)
    ... 48 more
Caused by: java.sql.SQLException: connection refused                <- the real root cause
    at ...
```

Read the first frame for where it was thrown, scan down for the first frame in your package for where it matters, and read the last `Caused by:` for the root cause. Frames marked `... n more` repeat the enclosing trace.

## Common interview questions

**What is the difference between checked and unchecked exceptions, and which should you use?**
Checked exceptions extend `Exception` and must be declared or caught; unchecked extend `RuntimeException` and need neither. Use unchecked for programming errors and most application failures, and reserve checked for cases where the direct caller can realistically recover. Most modern frameworks, including Spring, are unchecked throughout.

**`throw` versus `throws`?**
`throw` is the statement that raises an exception instance. `throws` is the clause in a method signature that declares which checked exceptions can escape.

**What does try-with-resources guarantee that `finally` does not?**
Closing in reverse order, closing even if the body throws, and preserving the body's exception while attaching any `close()` exception as suppressed. A hand-written `finally` tends to lose the original exception when `close()` also fails.

**Can `finally` change the return value?**
Yes, if it contains its own `return`, which also discards any pending exception. Assigning to a local inside `finally` does not change an already-evaluated return value. Treat `return` in `finally` as a bug.

**Why not `catch (Exception e)` everywhere?**
It swallows programming errors like `NullPointerException` alongside the failure you meant to handle, hides bugs, and makes recovery logic run in states it was not designed for. Catch the narrowest type you can handle, let the rest propagate to a boundary handler.

**How would you handle exceptions in a REST service?**
Throw domain exceptions from services, never catch in controllers, map them centrally with `@RestControllerAdvice` and `@ExceptionHandler` to status codes and a `ProblemDetail` body, and log once at that boundary with the correlation id.

**Why is throwing an exception expensive?**
`fillInStackTrace` captures every frame on construction. In a hot path that dominates. The fix is not to throw for expected outcomes: return `Optional`, a result type or a boolean instead.

**What is `Error` and should you catch it?**
A subclass of `Throwable` for conditions the application cannot recover from: `OutOfMemoryError`, `StackOverflowError`, `NoClassDefFoundError`. Do not catch it except at a top-level handler that logs and exits.
