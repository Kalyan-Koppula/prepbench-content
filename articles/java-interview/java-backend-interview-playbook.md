---
title: Java Backend Interview Playbook
order: 1
summary: What a Java backend loop looks like, how to spend four weeks, how to frame a frontend-to-backend move honestly, and the top 40 questions with where each is answered.
---

A Java backend loop is more predictable than a frontend one. The same forty questions come up again and again, the Spring questions are mostly "explain what this annotation really does", and the coding round is DSA in whichever language you choose. Your job is to make the predictable parts automatic so your attention goes to the design and project conversations, which are where a senior frontend engineer actually wins.

## What the loop looks like

| Round | Length | What they probe | How to prepare |
|---|---|---|---|
| Recruiter screen / online assessment | 30 min / 60–90 min | Basics, one or two coding problems | DSA patterns; practise in Java at least a little |
| Core Java | 45–60 min | Language semantics, OOP, generics, exceptions, `equals`/`hashCode`, immutability, records, sealed types, streams | Core Java and Collections tracks |
| Collections and concurrency | 45–60 min | `HashMap` internals, ordering, fail-fast, `ConcurrentHashMap`, executors, `CompletableFuture`, virtual threads, memory model, GC | Collections & Memory, Concurrency tracks |
| Spring and backend | 45–60 min | DI and bean lifecycle, Boot auto-configuration, REST with validation and errors, JPA, transactions, security, testing | Spring Boot, Persistence and Security tracks |
| System / low-level design | 60 min | HLD you already know, plus how it lands in Java: thread pools, caching, idempotency, consistency, observability | `/read/explaining-trade-offs-in-java-terms` |
| Coding | 45–60 min | One or two DSA problems, sometimes in Java | DSA sandbox plus `/read/java-coding-round-idioms` |
| Hiring manager / behavioural | 45 min | Why backend, why now, how you learn, the project walkthrough | `/read/capstone-bookmarks-service` |

Some companies collapse Core Java and Spring into one round; some add a take-home (a small REST service with tests, which the capstone prepares you for). Ask the recruiter for the round list and the language expectation for coding. "Any language" is common; "Java preferred" is a signal to do the coding round in Java.

## The four weeks

| Week | Focus | Output |
|---|---|---|
| 1 | Language: types, classes, interfaces, generics, exceptions, records, sealed, pattern matching, streams, `Optional` | Can read any Java file; writes idiomatic small programs; 2 DSA problems a day in Java |
| 2 | Collections, concurrency, memory: `HashMap`, `ConcurrentHashMap`, executors, `CompletableFuture`, virtual threads, JVM memory and GC basics | Can explain every collection choice and every thread you create; exercises passing |
| 3 | Spring Boot: DI, configuration, REST controllers, validation, Problem Details, testing slices, Actuator | A small service with tests you can explain line by line |
| 4 | Persistence and security, then the capstone and mocks | Capstone running in Docker with tests; two mock loops; this playbook's checklist green |

Daily: one quiz deck in review mode, one or two DSA problems, 60–90 minutes on the week's track. Keep a "questions I could not answer" list and clear it every weekend. From week 3, start every day with one trade-off question answered out loud for two minutes; the design round is a speaking exercise.

If you have less time, cut from the back of weeks 1 and 2 (GC tuning, memory model fine print), never from week 3 and 4, and never from the capstone.

## Framing a frontend-to-backend move

Do not hide it and do not apologise for it. The strongest framing is specific, honest, and forward-looking:

- Lead with the overlap. You have been a backend consumer for years: HTTP, REST design, auth flows, pagination, caching headers, error contracts, performance budgets, debugging distributed problems from the client side. Say that in concrete terms: "I've designed the API contracts I consumed and argued for cursor pagination and idempotency keys from the client side; now I want to own the other half."
- Name what is new to you and what you did about it. "Java and Spring are new as of this year. I built a bookmarks service with JWT auth, JPA with Flyway, tests at three levels and a Docker image, and I can walk you through the trade-offs." Interviewers forgive gaps they can see you are closing; they do not forgive bluffing.
- Translate, do not pretend. When you know a concept from JS, say so and map it: "This is the same shape as the Node event loop plus a worker pool; in Java the request thread blocks, so the thread pool size is the concurrency limit, and virtual threads change that." That shows transfer, which is what they are hiring.
- Bring your senior skills: code review, testing discipline, observability, incident experience, API design, mentoring. A team hiring a career-changer is betting on engineering maturity plus learning speed.
- When you do not know: "I haven't used that in Java; in Node I'd do X, and I'd expect the Java equivalent to be Y, is that right?" Then listen. Guessing confidently in a Java round gets caught.

What not to say: "Java is just like JavaScript with types" (it is not, and they know), "I can pick it up quickly" without evidence, or anything that sounds like backend is an upgrade from frontend.

## Top 40 questions checklist

Tick each when you can answer it out loud in under a minute without notes.

### Core Java

1. `==` versus `equals`, and the `equals`/`hashCode` contract. Core Java track.
2. Why is `String` immutable, and what does the string pool do? Core Java track.
3. Checked versus unchecked exceptions; when do you create your own? Core Java track.
4. Records, sealed interfaces and pattern matching: what problem does each solve? Core Java track.
5. Generics: `List<? extends T>` versus `List<? super T>`, and type erasure. Core Java track.
6. Interfaces versus abstract classes, default methods. Core Java track.
7. `Optional`: where to use it and where not. Core Java track.
8. Streams: lazy, intermediate versus terminal, when a loop is better. Core Java track and `/read/java-coding-round-idioms`.
9. Immutability: how to build an immutable class, `final` fields, defensive copies. Core Java track.
10. Boxing: `Integer` caching, `==` on wrappers, `int` versus `Integer` in collections. Core Java track.

### Collections, concurrency, memory

11. How does `HashMap` work: hashing, buckets, treeification, resize? Collections track.
12. `HashMap` versus `LinkedHashMap` versus `TreeMap`; `ArrayList` versus `LinkedList`. Collections track.
13. Fail-fast iterators and `ConcurrentModificationException`. Collections track.
14. `ConcurrentHashMap` versus `Collections.synchronizedMap`. Concurrency track.
15. `synchronized`, `volatile`, `ReentrantLock`, atomics: what each guarantees. Concurrency track.
16. `ExecutorService`: pool types, queue, rejection, shutdown. Concurrency track.
17. `CompletableFuture`: composing async work, exceptions, which executor. Concurrency track.
18. Virtual threads: what they are, when they help, pinning. Concurrency track and `/read/explaining-trade-offs-in-java-terms`.
19. JVM memory: heap vs stack, what causes `OutOfMemoryError`, GC in one paragraph. Memory track.
20. The Java memory model: happens-before in two sentences. Concurrency track.

### Spring and Boot

21. Dependency injection: constructor injection, bean scopes, lifecycle. Spring Boot track.
22. How does auto-configuration decide what to create? `@ConditionalOn…`, starters. Spring Boot track.
23. `@Component` versus `@Bean`, `@Configuration` proxying. Spring Boot track.
24. REST controller: `@RequestBody`, validation, `ResponseEntity`, status codes. Spring Boot track.
25. Global error handling with `@RestControllerAdvice` and Problem Details. Spring Boot track and `/read/capstone-bookmarks-service`.
26. Profiles, `@ConfigurationProperties`, externalised config and secrets. Spring Boot track and `/read/explaining-trade-offs-in-java-terms`.
27. Testing: unit vs `@WebMvcTest` vs `@DataJpaTest` vs `@SpringBootTest`, Testcontainers. Spring Boot track and `/read/migrations-and-testing-persistence`.
28. Actuator and Micrometer: what you expose and what you watch. `/read/explaining-trade-offs-in-java-terms`.

### Persistence and security

29. JPA versus Hibernate versus Spring Data. `/read/jpa-and-hibernate-essentials`.
30. Persistence context, entity states, `persist` versus `merge`. `/read/jpa-and-hibernate-essentials`.
31. Lazy versus eager, owning side, `equals`/`hashCode` on entities. `/read/jpa-and-hibernate-essentials`.
32. N+1: detect and fix. `/read/n-plus-one-transactions-and-performance`.
33. `@Transactional`: proxy, propagation, rollback rules, self-invocation. `/read/n-plus-one-transactions-and-performance`.
34. Optimistic versus pessimistic locking. `/read/n-plus-one-transactions-and-performance`.
35. Flyway workflow and why not `ddl-auto=update`. `/read/migrations-and-testing-persistence`.
36. Spring Security filter chain and a stateless JWT setup. `/read/spring-security-essentials`.
37. Password hashing, CSRF versus CORS, 401 versus 403. `/read/spring-security-essentials`.

### Design and project

38. Walk me through a project you built: architecture, trade-offs, what you'd change. `/read/capstone-bookmarks-service`.
39. How would you make this endpoint idempotent / cache it / paginate it / observe it? `/read/explaining-trade-offs-in-java-terms`.
40. Sync vs async, thread pool vs virtual threads, where a queue (Kafka) fits. `/read/explaining-trade-offs-in-java-terms`.

## Running the week before

- Two full mock loops with a friend or a recorder: one Core Java + collections, one Spring + design. Review the recording for filler and for answers that trailed off.
- Rehearse the capstone walkthrough until it is five minutes with a diagram, then ten minutes with trade-offs, then can absorb interruptions.
- Re-read your "could not answer" list; anything still open gets a one-paragraph answer written and spoken.
- Set up the coding environment you will use (IDE, `jshell`, a `Main.java` template) and run it once.
- Sleep. The Java rounds reward recall, and recall is the first thing fatigue removes.

## Answering "Tell me about a system you built"

This question appears in almost every backend loop, and most candidates ramble. A reliable structure takes about three minutes:

1. **The problem, in one sentence, with a number.** "Our checkout service timed out at peak, losing about 2% of orders."
2. **Your role.** "I led the backend changes with one other engineer."
3. **The design, at the level of boxes.** "Synchronous calls to inventory, pricing and payments in sequence. We parallelised inventory and pricing, made payment calls idempotent with keys, and moved confirmation emails to a queue."
4. **One deep decision.** "The hardest part was retries: without idempotency keys, a retried payment could charge twice, so we stored keys with the payment result in the same transaction."
5. **Result, with a number.** "p99 latency went from 2.4 s to 600 ms and timeout-related order loss dropped to near zero."
6. **What you'd do differently.** "I'd add load tests to CI earlier; we found the bottleneck in production."

Prepare two or three such stories in advance, each highlighting a different skill (performance, reliability, data modelling, collaboration). Interviewers will interrupt with "why" questions; the deep decision in step 4 is where you want them to dig.

## Common interview questions

**Why move from frontend to backend?**
Because the problems I find most interesting moved there: data modelling, consistency, performance under load, and owning the contract instead of consuming it. I have been at the API boundary for years and want to own both sides of it.

**How much Java do you actually know?**
Enough to build and test a Spring Boot service with JPA, Flyway, JWT security and Docker, and to explain the trade-offs in it. I'm newer to JVM tuning and large-scale concurrency than someone with five years of Java, and I say so.

**What would you do in your first 90 days?**
Ship small changes through the full pipeline early, read the codebase's transaction and error-handling conventions before adding my own, pair with the person who owns the data model, and bring observability and testing practices from my frontend work where they fit.

**What is the hardest thing about Java after JavaScript?**
Thinking in threads instead of an event loop: every blocking call holds a thread, pools bound concurrency, and shared mutable state needs explicit synchronisation. The second thing is the ORM: a persistence context is more powerful and more surprising than any client-side cache.

**How do you learn a new stack quickly?**
Build something real with tests, read one good source end to end instead of ten tutorials, keep a list of things I could not explain, and get my code reviewed by someone who knows the idioms.

## Key takeaways

- Know the loop: coding, Java and Spring fundamentals, system design, and behavioural rounds.
- Prepare on a schedule: fundamentals, then Spring and data, then design and mock interviews.
- Frame a frontend-to-backend move around transferable strengths: APIs, performance, testing, user impact.
- Rehearse two or three project stories with numbers and one deep technical decision each.
- In the final week, review notes and mistakes logs rather than learning new topics.
