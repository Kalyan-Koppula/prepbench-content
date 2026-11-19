---
title: CompletableFuture and Async Composition
order: 4
summary: thenApply vs thenCompose vs thenCombine, fan-out with allOf, exception handling, which thread runs each stage, timeouts, and a side-by-side table against JavaScript Promises.
---

`CompletableFuture` is Java's Promise, designed by people who had seen Promises. You already know the composition model; what interviewers test is the Java-specific surface: the three `then*` families, the `Async` suffix and which executor it picks, how exceptions travel, and why `get()` inside a stage is a bug.

## Promise to CompletableFuture

| JavaScript | Java |
|---|---|
| `new Promise((res, rej) => ...)` | `new CompletableFuture<>()` then `complete(v)` / `completeExceptionally(e)` |
| `Promise.resolve(v)` | `CompletableFuture.completedFuture(v)` |
| Run async work | `CompletableFuture.supplyAsync(supplier, executor)` / `runAsync(runnable, executor)` |
| `.then(v => x)` | `.thenApply(v -> x)` |
| `.then(v => anotherPromise)` (auto-flattened) | `.thenCompose(v -> anotherFuture)` (not auto-flattened: `thenApply` would give `CompletableFuture<CompletableFuture<X>>`) |
| `.then(v => { sideEffect })` | `.thenAccept(v -> ...)` / `.thenRun(() -> ...)` |
| `Promise.all([a, b]).then(([x, y]) => ...)` for two | `a.thenCombine(b, (x, y) -> ...)` |
| `Promise.all(list)` | `CompletableFuture.allOf(arr...)` then collect each `join()` (returns `CompletableFuture<Void>`) |
| `Promise.race` | `CompletableFuture.anyOf(arr...)` (first to complete, including exceptionally) |
| `Promise.allSettled` | `allOf` + `handle` on each |
| `.catch(e => fallback)` | `.exceptionally(e -> fallback)` |
| `.then(onOk, onErr)` | `.handle((v, e) -> ...)` |
| `.finally(() => ...)` | `.whenComplete((v, e) -> ...)` |
| `await p` | `p.join()` (unchecked) or `p.get()` (checked, blocks a thread; no suspension) |
| Microtask queue | No scheduler: a stage runs on the completing thread or on an executor |
| Unhandled rejection warning | Nothing; a dropped exceptional future is silent |

The structural difference: JS continuations always run later on the microtask queue; Java continuations run *synchronously on whichever thread completes the previous stage*, unless you use an `Async` variant.

## Building a pipeline

```java
ExecutorService io = Executors.newVirtualThreadPerTaskExecutor();   // or a bounded pool

CompletableFuture<Order> order = CompletableFuture.supplyAsync(() -> orders.load(id), io);
CompletableFuture<Customer> customer = order.thenCompose(o -> fetchCustomerAsync(o.customerId()));
CompletableFuture<Price> price = order.thenApply(o -> pricing.quote(o));

CompletableFuture<Invoice> invoice = customer.thenCombine(price, (c, p) -> new Invoice(c, p));

invoice.thenAccept(mailer::send);
Invoice result = invoice.join();      // block only at the boundary (test, main, legacy caller)
```

- `thenApply`: sync transform, `T -> U`.
- `thenCompose`: transform that itself returns a future, `T -> CompletableFuture<U>`, flattened. It is `flatMap`.
- `thenCombine`: wait for two independent futures and merge. The two futures run concurrently because both were started before `thenCombine` was called.
- `thenAccept`/`thenRun`: terminal side effects, produce `CompletableFuture<Void>`.

## Fan-out and fan-in

```java
List<CompletableFuture<Review>> futures = ids.stream()
    .map(id -> CompletableFuture.supplyAsync(() -> reviews.fetch(id), io))
    .toList();

CompletableFuture<List<Review>> all = CompletableFuture
    .allOf(futures.toArray(CompletableFuture[]::new))
    .thenApply(v -> futures.stream().map(CompletableFuture::join).toList());
```

`allOf` returns `CompletableFuture<Void>`; you read results by `join`ing the originals afterwards, which does not block because they are complete. If any input failed, `allOf` completes exceptionally with a `CompletionException` wrapping the *first* failure it observed; the others are not cancelled.

`anyOf` resolves with the first to finish, success or failure, and gives you `CompletableFuture<Object>`, so cast.

## Exceptions

```java
CompletableFuture<String> f = CompletableFuture.supplyAsync(() -> risky())
    .thenApply(String::toUpperCase)             // skipped if risky() threw
    .exceptionally(e -> {                       // e is a CompletionException wrapping the cause
        log.warn("failed", e.getCause());
        return "fallback";
    });

f.handle((v, e) -> e == null ? v : "fallback");   // runs on both paths, maps to a value
f.whenComplete((v, e) -> metrics.record(e));      // runs on both paths, does not change the result
f.exceptionallyCompose(e -> retryAsync());        // Java 12+, async fallback
```

- An exception in any stage skips every dependent "normal" stage down the chain until an `exceptionally`/`handle`/`whenComplete`.
- Inside handlers the throwable is usually a `CompletionException`; unwrap with `getCause()`.
- `join()` throws unchecked `CompletionException`; `get()` throws checked `ExecutionException` (and `InterruptedException`). Prefer `join` in pipelines.
- Nothing warns about an unobserved failure. Always terminate a chain with a handler or a `join`.
- `cancel(true)` completes the future with `CancellationException` but does not interrupt the running task (unlike `Future` from an executor). Cancel is best effort.

## Which thread runs what

| Call | Runs on |
|---|---|
| `supplyAsync(s)` / `runAsync(r)` | `ForkJoinPool.commonPool()` (or a new thread per task if parallelism < 2) |
| `supplyAsync(s, executor)` | The given executor |
| `thenApply(fn)` on a not-yet-complete future | The thread that completes the previous stage, right after it does |
| `thenApply(fn)` on an already-complete future | The calling thread, synchronously |
| `thenApplyAsync(fn)` | Common pool |
| `thenApplyAsync(fn, executor)` | The given executor |

Consequences:

- The common pool is sized to cores − 1 and shared by parallel streams and every library that was lazy. Blocking in it (JDBC, HTTP) starves everything. Pass an explicit executor for I/O; in Java 21, a virtual-thread executor.
- A non-`Async` stage after a `supplyAsync(s, io)` runs on the `io` thread; chaining a CPU-heavy transform there blocks that worker. Use `thenApplyAsync(fn, cpuPool)` to hop.
- Calling `join()` or `get()` inside a stage blocks a pool thread while waiting for another pool task: with a small pool this deadlocks. Compose with `thenCompose` instead.

## Timeouts and manual completion

```java
CompletableFuture<Quote> q = fetchQuote(id)
    .orTimeout(2, TimeUnit.SECONDS)                 // Java 9+: fails with TimeoutException
    .completeOnTimeout(Quote.EMPTY, 2, TimeUnit.SECONDS);   // or: default value instead

// Bridging a callback API
CompletableFuture<Response> cf = new CompletableFuture<>();
client.send(request, new Callback() {
    public void onSuccess(Response r) { cf.complete(r); }
    public void onFailure(Throwable t) { cf.completeExceptionally(t); }
});
```

`orTimeout` and `completeOnTimeout` use a shared single-thread scheduler; the underlying work keeps running. Combine with a `whenComplete` that cancels or closes the resource if the task must stop.

`CompletableFuture` implements `CompletionStage`, which is the interface to expose from APIs so callers cannot call `complete` on your future. `toCompletableFuture()` converts back.

## Worked example: a product page from three services

The page needs product details (required), reviews (optional) and recommendations (optional). Calls should run in parallel, optional parts should fall back on failure, and the whole thing must finish within 800 ms.

```java
ExecutorService io = Executors.newVirtualThreadPerTaskExecutor(); // or a bounded pool for blocking clients

CompletableFuture<Product> product = CompletableFuture
    .supplyAsync(() -> catalog.getProduct(id), io)
    .orTimeout(500, TimeUnit.MILLISECONDS); // required: fail the page if it's slow

CompletableFuture<List<Review>> reviews = CompletableFuture
    .supplyAsync(() -> reviewService.forProduct(id), io)
    .completeOnTimeout(List.of(), 300, TimeUnit.MILLISECONDS) // optional: empty after 300 ms
    .exceptionally(e -> {
        log.warn("reviews failed for {}", id, e);
        return List.of();
    });

CompletableFuture<List<Product>> recommendations = CompletableFuture
    .supplyAsync(() -> recommender.similarTo(id), io)
    .completeOnTimeout(List.of(), 300, TimeUnit.MILLISECONDS)
    .exceptionally(e -> List.of());

ProductPage page = CompletableFuture.allOf(product, reviews, recommendations)
    .thenApply(ignored -> new ProductPage(product.join(), reviews.join(), recommendations.join()))
    .get(800, TimeUnit.MILLISECONDS); // overall deadline for the caller
```

How it behaves:

| Scenario | Result |
| --- | --- |
| All three respond in 200 ms | Full page in about 200 ms (parallel, not 600 ms sequential) |
| Reviews service is down | Page with no reviews; a warning in the logs |
| Recommendations take 2 s | Page after 300 ms with no recommendations |
| Catalog takes 600 ms | `TimeoutException` from `product`, so the page fails, as intended for a required part |

`join()` inside `thenApply` doesn't block, because `allOf` guarantees all three are complete by then. Note that `orTimeout` and `completeOnTimeout` complete the **future**; they don't cancel the underlying HTTP call. Give the clients their own timeouts too.

## Spring and `@Async`

`@Async` on a bean method returning `CompletableFuture<T>` runs it on the configured `TaskExecutor`. Plain Spring defaults to `SimpleAsyncTaskExecutor` (a new thread per call); Boot auto-configures a bounded `ThreadPoolTaskExecutor`, and with `spring.threads.virtual.enabled=true` (3.2+) a virtual-thread-per-task executor. Self-invocation bypasses the proxy, so `@Async` on a method called from the same class does nothing: a classic interview gotcha.

## Common interview questions

**`thenApply` vs `thenCompose`?** `thenApply` maps the value with a plain function; if that function returns a future you get a nested future. `thenCompose` takes a function returning a future and flattens it, like `flatMap` or how JS `then` auto-unwraps. Use `thenCompose` whenever the next step is itself asynchronous.

**How do you run several calls in parallel and wait for all?** Start each with `supplyAsync` on an explicit executor, collect the futures, then `CompletableFuture.allOf(...)` and `thenApply` that `join`s each one. If one fails, `allOf` fails; use `handle` per future first to implement `allSettled`.

**On which thread does a `thenApply` callback run?** If the previous stage is still running, on the thread that completes it; if it has already completed, on the thread calling `thenApply`. `thenApplyAsync` forces the common pool or the executor you pass.

**Why is blocking inside the common `ForkJoinPool` a problem?** It has only cores − 1 threads and is shared JVM-wide by parallel streams and default async stages. A few blocking I/O calls occupy all of them, and every other async operation stalls. Give I/O its own executor or virtual threads.

**How are exceptions propagated?** A failed stage completes exceptionally; dependent stages are skipped and complete exceptionally with a `CompletionException` wrapping the cause, until an `exceptionally`, `handle` or `whenComplete` observes it. `join` rethrows `CompletionException`; `get` rethrows `ExecutionException`.

**How do you add a timeout?** `orTimeout(d, unit)` fails the future with `TimeoutException` after the delay; `completeOnTimeout(value, d, unit)` substitutes a default. Neither stops the underlying work, so cancel or close resources in a `whenComplete` if that matters.

**How does `CompletableFuture` compare to a JS Promise?** Same composition model (`thenApply` is `then`, `thenCompose` is `then` returning a promise, `allOf` is `Promise.all`). Differences: no implicit scheduler, so callbacks run on the completing thread unless you say `Async`; `thenCompose` is explicit; failures are silent if unobserved; `join` really blocks a thread rather than suspending.

**What does `cancel` do on a `CompletableFuture`?** It completes the future with `CancellationException` so dependents fail, but it does not interrupt the thread executing the supplier. To actually stop work, propagate a flag or cancel the executor-level `Future`.

## Pitfalls

- Calling `get()` or `join()` immediately after `supplyAsync`, which makes the code synchronous with extra steps.
- Running blocking calls on the common `ForkJoinPool` (the default executor), starving parallel streams and other async work.
- Forgetting that exceptions are wrapped in `CompletionException`; unwrap the cause when inspecting.
- Losing exceptions by never attaching `exceptionally`, `handle` or a final `join`.
- Assuming timeouts cancel the underlying work.

## Key takeaways

- `CompletableFuture` is Java's promise: compose with `thenApply`, `thenCompose`, `thenCombine`, `allOf`, `anyOf`.
- Pass an explicit executor for blocking work.
- Handle failures per branch with `exceptionally` or `handle`; use `completeOnTimeout` for optional parts and `orTimeout` for required ones.
- Fan out in parallel, then fan in with `allOf` and `join`.
- With virtual threads, plain blocking code in parallel tasks is often simpler than long async chains.
