---
title: Spring Boot REST APIs
order: 7
module: spring-boot-rest
summary: Boot anatomy and the request path, controllers and binding, validation and Problem Details, pagination and versioning, test slices, and resilient outbound calls.
---

## What are the three annotations inside `@SpringBootApplication`?

`@SpringBootConfiguration` (a `@Configuration`), `@EnableAutoConfiguration` (apply the conditional configurations found on the classpath), and `@ComponentScan` (scan from this class's package down). That's why the main class lives in the root package.

## Trace a request from the socket to a controller method.

A Tomcat worker thread runs the servlet filter chain, including Spring Security, then `DispatcherServlet` asks the handler mapping for the matching method, runs interceptors, resolves arguments (path, query, JSON body through a message converter, validation), invokes the controller, writes the return value with a converter, and routes any exception through the resolvers and `@ControllerAdvice`.

## Filter versus `HandlerInterceptor`?

A filter is Servlet API, runs before `DispatcherServlet` for every request and wraps the whole chain. An interceptor is Spring MVC, runs around the chosen handler and knows which controller method matched. Security, encoding and correlation ids are filters; per-endpoint concerns are interceptors or aspects.

## Why doesn't `@ControllerAdvice` catch a 401 from Spring Security?

Authentication happens in the security filter chain before any handler is chosen, so the exception never enters MVC's exception resolvers. Customise `AuthenticationEntryPoint` and `AccessDeniedHandler`, reusing the same error body writer.

## What is a Spring Boot starter?

A dependency-only POM that pulls in a coherent, version-aligned set of libraries for one feature, such as `spring-boot-starter-data-jpa` bringing Hibernate, Spring Data, Hikari and transaction support. Auto-configuration then creates the beans those libraries imply.

## How does Spring MVC handle concurrent requests, and what do virtual threads change?

Each in-flight request occupies one Tomcat thread from a bounded pool, including while it blocks on the database. With `spring.threads.virtual.enabled=true` on Java 21 each request runs on a cheap virtual thread, so blocking parks instead of holding a platform thread, and thread-per-request scales without reactive code.

## `@Controller` versus `@RestController`?

`@RestController` is `@Controller` plus `@ResponseBody` on every method, so return values are written through a message converter as the response body instead of being resolved as view names. For a JSON API it's always the right one.

## How does Spring pick the response format?

Content negotiation: it matches the request's `Accept` header against the handler's `produces` and the registered `HttpMessageConverter`s in order; Jackson claims `application/json`. No acceptable converter gives 406, an unsupported request `Content-Type` gives 415.

## When do you return `ResponseEntity` instead of a plain object?

When status or headers vary per call: 201 with a `Location`, 204 with no body, conditional 304, file downloads. Otherwise return the DTO directly with `@ResponseStatus` where needed and let exceptions produce error statuses; it keeps signatures and tests simpler.

## How do you bind a dozen optional query parameters cleanly?

Declare a record with those fields and take it as a plain (or `@ModelAttribute`) parameter; Spring binds each query key to the matching component, and Bean Validation and `@DateTimeFormat` work on it. Avoid a method with twelve `@RequestParam`s.

## Why not return JPA entities from controllers?

The schema leaks into the API, lazy relations blow up or recurse at serialisation, binding a request onto an entity enables mass assignment, and validation rules differ per operation. Use separate request and response records and map explicitly.

## What status does Spring return for malformed JSON, and for a missing required query parameter?

Both are 400 via `DefaultHandlerExceptionResolver`: `HttpMessageNotReadableException` for the body and `MissingServletRequestParameterException` for the parameter. Extending `ResponseEntityExceptionHandler` lets you give them your error shape.

## What's the `-parameters` compiler flag got to do with Spring MVC?

Spring 6.1+ reads parameter names from the class file to match `@PathVariable long id` without an explicit name. Without the flag you get "Name for argument not specified" at runtime. Boot's Maven parent and Gradle plugin set it for you.

## `@Valid` versus `@Validated`?

`@Valid` is the Jakarta annotation: validate this object and cascade into nested `@Valid` members. `@Validated` is Spring's: it supports validation groups and, placed on a class, turns on method-level validation of parameters and return values through a proxy.

## Validation annotations on a DTO don't seem to run. Most likely cause?

No `@Valid` on the `@RequestBody` parameter. Also check: `spring-boot-starter-validation` is on the classpath, list elements need `List<@Valid Item>`, and `@NotNull` on a primitive can never fail.

## Which exception does a failed `@Valid @RequestBody` throw, and what status results?

`MethodArgumentNotValidException`, mapped to 400 by Spring MVC. Its `BindingResult` holds every field error, so one advice can turn them into a list of `{field, message}` entries in the error body.

## What is RFC 9457 Problem Details and how does Spring support it?

A standard JSON error body served as `application/problem+json` with `type`, `title`, `status`, `detail`, `instance` plus extension fields. Spring 6 has `ProblemDetail` and `ErrorResponseException`, and `spring.mvc.problemdetails.enabled=true` emits it for all framework exceptions.

## How do you guarantee stack traces and SQL never reach API clients?

A catch-all `@ExceptionHandler(Exception.class)` that logs the full exception with a request id and returns a generic 500 body carrying that id; keep Boot's `server.error.include-stacktrace=never`; map `DataIntegrityViolationException` to a 409 with a fixed message rather than its SQL-laden `getMessage()`.

## Where does each kind of validation belong?

Shape and format at the edge with Bean Validation on request records; business rules in the service and domain because they need data and run for non-HTTP callers too; database constraints as the final arbiter for things like uniqueness. Each layer rejects what only it can know.

## How does `Pageable` get into a controller method, and what does `Page` cost?

Spring Data's argument resolver binds `page`, `size` and `sort` query parameters onto a `Pageable`. `Page<T>` runs an extra count query per request; `Slice<T>` fetches one extra row to know if there's more and skips the count.

## Offset versus cursor pagination — when do you pick cursor?

When the dataset is large or changes while being read: feeds, logs, exports. A keyset query (`WHERE (created_at, id) < (?, ?)`) is constant-time at any depth and doesn't duplicate or skip rows on insert, at the cost of random page access and needing a total ordering with a unique tiebreaker.

## How would you implement flexible filtering on a list endpoint?

Bind a filter record from query parameters and convert it into a JPA `Specification` or Querydsl predicate that adds a condition only for supplied fields. Whitelist filterable and sortable fields, index them, and reject unknown parameters.

## Which API versioning strategy do you recommend?

Be additive and avoid versioning when you can. For unavoidable breaks, URI versioning for public APIs because it's explicit and cache-friendly; header or media-type versioning when URLs must stay stable. Keep two versions live at most with sunset headers. Spring Framework 7 adds native `version` attributes on mappings.

## How do you make a `POST` safe for clients to retry?

An `Idempotency-Key` header: store the key with a request fingerprint and the eventual response, return the stored response on repeats, insert the key atomically with the write so concurrent duplicates are serialised by a unique constraint, expire keys after a day, and reject reuse with a different body.

## What does `@WebMvcTest` load?

The MVC layer only: the named controllers, `@ControllerAdvice`, filters, interceptors, message converters, validation and Security configuration, exercised through `MockMvc` without a port. Services and repositories aren't loaded; supply them with `@MockitoBean`.

## `@MockBean` versus `@MockitoBean`?

Same job: replace a bean in the test context with a Mockito mock. Spring Framework 6.2 moved the feature into the framework as `@MockitoBean` and `@MockitoSpyBean`; Boot 3.4 deprecated `@MockBean` and Boot 4 removed it. Each distinct set of mocked beans is a new cached context.

## Why would a Spring Boot test suite be slow, and what do you do?

Many distinct application contexts because each class uses different mocks, properties or profiles, each costing seconds, plus containers per class. Standardise a couple of test configurations so the context cache hits, share Testcontainers via one `@ServiceConnection` config, and push logic down into slices and unit tests.

## `MockMvc` versus `TestRestTemplate`?

`MockMvc` drives the `DispatcherServlet` in-process: fast, no port, full MVC behaviour but no real server. `TestRestTemplate` or `WebTestClient` with `RANDOM_PORT` go through real HTTP and Tomcat, so use them for a few end-to-end journeys and `MockMvc` for everything controller-level.

## How do you run repository tests against a real database?

Testcontainers: a `PostgreSQLContainer` wired with `@ServiceConnection`, schema from the same Flyway migrations as production, and `@DataJpaTest` with `@AutoConfigureTestDatabase(replace = NONE)` so Boot doesn't swap in H2.

## Which HTTP client would you use in a new Boot 3.5 service?

`RestClient`: blocking, fluent, auto-configured by Boot with Jackson, tracing and timeouts, and cheap to block on with virtual threads. `WebClient` only in a WebFlux app or for streaming; `RestTemplate` only where it already exists.

## Which timeouts must every outbound HTTP call have?

A connect timeout (short, a second or two) and a read timeout derived from the dependency's p99 and your own SLA, plus a per-host connection pool cap. Without them a hung dependency ties up every request thread and the outage spreads upstream.

## When is it safe to retry a failed outbound call?

Only when the operation is idempotent or carries an idempotency key, and the failure is transient such as a connect timeout, 503 or 429. Few attempts with exponential backoff and jitter, honouring `Retry-After`, never on 4xx validation errors and never inside a database transaction.

## How does a circuit breaker differ from a retry?

A retry re-attempts one failed call. A breaker watches the failure rate over a window and, once a dependency is clearly unhealthy, opens and fails calls instantly for a wait period, then half-opens to probe. Retries sit outside the breaker so they don't hammer an open circuit.

## When is WebFlux worth it over MVC with virtual threads?

When the whole stack is non-blocking (R2DBC, reactive messaging), for streaming or backpressured pipelines, or for an I/O-heavy fan-out gateway. For ordinary APIs, MVC on virtual threads gives similar throughput with plain imperative code, exceptions and debuggers, so it's the default.
