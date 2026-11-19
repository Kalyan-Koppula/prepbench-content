---
title: Lombok, Jackson and Logging
order: 4
summary: The Lombok annotations worth using and the @Data traps, Jackson mapping and its common errors, SLF4J/Logback with MDC and structured logs, and validating at boundaries.
---

Three libraries appear in every Spring codebase and in every code-review-style interview: Lombok (generated boilerplate), Jackson (JSON) and SLF4J/Logback (logging). You're expected to know what they generate, where they bite, and how a JSON mismatch or a lost log line is diagnosed.

## Lombok

Lombok is an annotation processor that generates members at compile time. It needs the IDE plugin and `optional`/`provided` scope. Since Java 16 records cover the immutable-DTO case, so Lombok's remaining value is on mutable classes and entities.

| Annotation | Generates | Use it for |
|---|---|---|
| `@Getter` / `@Setter` | accessors | entities, config classes |
| `@RequiredArgsConstructor` | constructor for `final` fields | **Spring services**: constructor injection without writing the constructor |
| `@AllArgsConstructor` / `@NoArgsConstructor` | the obvious | JPA entities need a no-arg constructor |
| `@Builder` | fluent builder | objects with many optional fields; test data |
| `@Value` | immutable class: private final fields, getters, equals/hashCode/toString, all-args ctor | pre-record immutables; prefer a record now |
| `@Slf4j` | `private static final Logger log = LoggerFactory.getLogger(X.class)` | everywhere |
| `@ToString(exclude = "password")` / `@EqualsAndHashCode(of = "id")` | controlled versions | entities |
| `@Data` | `@Getter @Setter @ToString @EqualsAndHashCode @RequiredArgsConstructor` | avoid on entities |

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository repo;      // injected via generated constructor
    private final Clock clock;
}

@Builder
@Getter
public class SearchOptions {
    private final String query;
    @Builder.Default private final int limit = 20;     // without @Builder.Default this would be 0
    private final boolean includeArchived;
}
// SearchOptions.builder().query("shoes").build()  → limit 20
```

### `@Data` traps

- `equals`/`hashCode` over **all fields**. On a JPA entity, the id is `null` before persist, so the entity's hash changes after save; a `HashSet` of entities breaks. Bidirectional relations make `equals`/`toString` recurse until `StackOverflowError`. Use `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` with the business key, or write them by hand.
- `toString` touches every field, so a lazy JPA collection gets loaded by a log statement (`LazyInitializationException` outside a session).
- Setters on everything: there's no invariant you can protect. For DTOs use records; for entities expose intent methods (`order.cancel()`), not `setStatus`.
- `@Builder` ignores field initialisers unless you add `@Builder.Default`; `private int retries = 3` silently becomes `0` when built.
- `@Builder` with `@NoArgsConstructor` (needed by JPA/Jackson) requires `@AllArgsConstructor` too, or the builder fails to compile.
- Records vs Lombok: records give immutability, pattern matching and no plugin dependency; Lombok gives mutability and builders. Teams on Java 21 generally use records for DTOs and Lombok only on entities and services.

## Jackson

Spring Boot auto-configures one `ObjectMapper` (Jackson 2.x in Boot 3; Jackson 3 under `tools.jackson` in Boot 4) and uses it for `@RequestBody`/`@ResponseBody`. Boot's defaults differ from raw Jackson: unknown properties are **ignored**, dates are written as ISO-8601 strings not timestamps, and `JavaTimeModule` is registered.

```java
public record CreateUserRequest(
    @JsonProperty("user_name") String userName,           // rename one property
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate birthDate,
    @JsonInclude(JsonInclude.Include.NON_NULL) String nickname) {}

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)   // rename all properties on this type
public record UserResponse(String userName, Instant createdAt, @JsonIgnore String passwordHash) {}
```

```yaml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE       # global naming
    default-property-inclusion: non_null
    deserialization:
      fail-on-unknown-properties: false        # Boot default already
    time-zone: UTC
```

Rules to say out loud:

- Jackson finds properties via getters/setters or, for records, the canonical constructor and accessors. A class with no getters and no annotations serialises to nothing and throws `InvalidDefinitionException: No serializer found`.
- Deserialisation into a class needs a no-arg constructor plus setters, or a `@JsonCreator` constructor; records just work (Jackson 2.12+).
- Dates: use `java.time` types; `Instant` serialises as `2026-01-05T10:15:30Z`. Never `java.util.Date`. Set `time-zone: UTC` if you must deal with `LocalDateTime`, or better, don't use `LocalDateTime` for timestamps at all.
- `@JsonIgnore` for fields that must never leave (password hashes), `@JsonIgnoreProperties(ignoreUnknown = true)` on types that accept partial input, `@JsonProperty(access = WRITE_ONLY)` for write-only fields like a password on sign-up.
- Polymorphism: `@JsonTypeInfo(use = NAME, property = "type")` + `@JsonSubTypes({@Type(value = Card.class, name = "card"), ...})` on a sealed interface. Never enable default typing on untrusted input (it was the source of the famous deserialisation CVEs).
- Views (`@JsonView`), `@JsonUnwrapped`, custom `JsonSerializer` — know they exist.

### Errors you will see

| Message | Cause | Fix |
|---|---|---|
| `UnrecognizedPropertyException` | client sent a field you don't have and `FAIL_ON_UNKNOWN_PROPERTIES` is on | Boot turns it off; if you turned it on, add `@JsonIgnoreProperties(ignoreUnknown = true)` |
| `No serializer found for class … and no properties discovered` | no getters / private fields, or a Hibernate lazy proxy | add accessors, or map to a DTO before returning |
| `Cannot construct instance of X (no Creators, like default constructor, exist)` | class has no usable constructor | add a no-arg ctor or `@JsonCreator`, or use a record |
| `Cannot deserialize value of type java.time.Instant from String` | `JavaTimeModule` missing (only outside Boot) | register it |
| `InvalidFormatException … not one of the values accepted for Enum` | case mismatch | `@JsonProperty` on enum constants or `ACCEPT_CASE_INSENSITIVE_ENUMS` |
| `JsonMappingException: Infinite recursion` | bidirectional JPA relation returned straight from a controller | return DTOs; or `@JsonManagedReference`/`@JsonBackReference` |
| `HttpMessageNotReadableException` (400) | the request body failed any of the above | Spring wraps every parse error in this; log the cause |

## Logging

SLF4J is the API (`org.slf4j.Logger`); Logback is Boot's default implementation; Log4j2 is the alternative you swap in by excluding `spring-boot-starter-logging`. Code against SLF4J only — never `System.out` or `java.util.logging` directly.

```java
log.info("order placed id={} total={}", order.id(), order.total());   // placeholders, no string concat
log.warn("payment retry {} for order {}", attempt, orderId);
log.error("payment failed for order {}", orderId, ex);                 // exception as last arg → stack trace
if (log.isDebugEnabled()) log.debug("cart={}", cart.toDebugString());  // only when building the arg is expensive
```

Levels: `TRACE < DEBUG < INFO < WARN < ERROR`. Boot's default root level is `INFO`. Set per package:

```yaml
logging:
  level:
    root: info
    com.acme.orders: debug
    org.hibernate.SQL: debug                   # see the SQL
    org.springframework.web: debug             # see request mapping decisions
  structured:
    format:
      console: ecs                             # Boot 3.4+: JSON lines (ecs | gelf | logstash)
```

Guidelines interviewers care about:

- Log at the boundary, once per event, with ids. `ERROR` means a human must look; `WARN` means degraded but handled; `INFO` is business events; `DEBUG` is for you.
- Never log secrets, tokens, full card numbers or full request bodies. Mask in a custom `toString` or a Logback `replace` converter.
- Don't log-and-rethrow; you get the same stack trace at every layer. Log once where you handle it.
- Parameterised messages aren't just style: the string is built only if the level is enabled.

### MDC and correlation

MDC (mapped diagnostic context) is a thread-local map Logback prints with every line. Put the request id in at the edge, read it in every log statement for free:

```java
@Component
public class CorrelationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader("X-Request-Id")).orElse(UUID.randomUUID().toString());
        MDC.put("requestId", id);
        res.setHeader("X-Request-Id", id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();            // thread is pooled; don't leak the id into the next request
        }
    }
}
```

Pattern: `%d %-5level [%X{requestId}] %logger{36} - %msg%n`. Micrometer Tracing (Boot 3) does this automatically with `traceId`/`spanId` and propagates across HTTP calls. MDC does **not** cross threads: with `@Async` or `CompletableFuture` you copy it yourself (a `TaskDecorator`) — virtual threads have the same problem.

Structured logging (JSON per line) is what log aggregators want: fields instead of regexes. In Boot 3.4+ it's one property, and you can add fields via `logging.structured.json.add` or a `StructuredLogFormatter`.

## Validation at boundaries

Two complementary mechanisms:

- **Bean Validation** on inputs crossing a boundary: `@Valid @RequestBody`, `@NotBlank`, `@Size`, `@Email` on DTOs. Framework-driven, produces a 400 with field errors. Covered in the REST track.
- **Internal invariants** in constructors and methods with plain Java:

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        Objects.requireNonNull(amount, "amount");
        Objects.requireNonNull(currency, "currency");
        if (amount.scale() > currency.getDefaultFractionDigits())
            throw new IllegalArgumentException("too many decimals: " + amount);
    }
}

public Order(Customer customer, List<Line> lines) {
    this.customer = Objects.requireNonNull(customer);
    this.lines = List.copyOf(lines);        // defensive copy, also rejects null elements
    if (lines.isEmpty()) throw new IllegalArgumentException("order needs at least one line");
}
```

`Objects.requireNonNull` fails fast at the point of construction with a message naming the field, rather than an NPE three layers later. `IllegalArgumentException` for bad values, `IllegalStateException` for "not allowed now". Don't use Bean Validation annotations on domain objects and expect them to be checked — nothing runs the validator unless Spring's web layer or `@Validated` method validation triggers it.

Null-safety annotations: Spring 7 / Boot 4 adopt JSpecify (`@NullMarked` packages, `@Nullable`); in Boot 3 you'll see `org.springframework.lang.Nullable` or Jakarta's. Return `Optional` from finders, never pass it as a parameter, and never return `null` collections.

## Worked example: a request DTO from JSON to validated object

```java
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(max = 100) String name,
    @JsonProperty("date_of_birth") @Past LocalDate dateOfBirth,
    @NotNull Role role) {}

@PostMapping("/users")
ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
    log.info("Creating user role={}", request.role()); // parameterised, no PII like the email
    User user = users.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
}
```

The request travels through three tools:

1. **Jackson** reads `{"email": "...", "name": "...", "date_of_birth": "1990-05-01", "role": "ADMIN"}` into the record (records are supported natively; `@JsonProperty` maps the snake-case field; the JavaTimeModule, registered by Spring Boot, parses the `LocalDate`). Unknown properties are ignored by Spring Boot's default configuration; an invalid enum value becomes a 400 error.
2. **Bean Validation** (`@Valid`) checks the constraints and, on failure, Spring returns a 400 with the field errors before your code runs.
3. **Logging** through SLF4J records the event with placeholders, which avoid building strings when the level is disabled and keep personal data out of logs.

A record replaces the Lombok `@Data` class this would once have been. Lombok remains useful for builders on large classes and for `@Slf4j`, but records cover most DTOs without an annotation processor.

## Structured logging in production

Plain-text logs are hard to query. Most production setups log JSON with consistent fields, plus a correlation id per request:

```java
try (var ignored = MDC.putCloseable("requestId", requestId)) {
    log.info("Order placed orderId={} amount={}", order.id(), order.amount());
}
```

```json
{"ts":"2025-03-01T10:15:30Z","level":"INFO","logger":"OrderService","msg":"Order placed orderId=42 amount=19.99","requestId":"a1b2c3"}
```

The MDC (mapped diagnostic context) attaches the request id to every log line in that thread, so one request can be followed across services when the id is passed in a header. Spring Boot 3.4+ supports structured JSON logging with a single property, and tracing (Micrometer Tracing) adds trace and span ids automatically.

## Common interview questions

**Why do people say not to use `@Data` on JPA entities?**
Because it generates `equals`/`hashCode` over all fields, including a database id that changes on persist and lazy relations that may recurse or trigger loading, and because setters on every field defeat encapsulation. Use `@Getter`, a business-key `@EqualsAndHashCode`, and explicit methods.

**Should DTOs be records or Lombok classes?**
Records on Java 16+: immutable, concise, no plugin, Jackson and Bean Validation support them. Lombok remains for mutable classes, builders on large objects, and `@Slf4j`.

**A field is missing from your JSON response. What do you check?**
Does the type expose it (getter / record component)? Is it `null` with `NON_NULL` inclusion configured? Is there a `@JsonIgnore` or `@JsonView`? Is the naming strategy renaming it to `snake_case`? Is a Hibernate proxy being serialised instead of the DTO?

**Why log with `{}` placeholders instead of string concatenation?**
The message is only formatted if the level is enabled, so disabled `DEBUG` lines cost nothing. It also keeps the arguments available to structured encoders as separate fields.

**How do you correlate log lines from one request across services?**
Generate or accept a request/trace id in a filter, put it in MDC so every line carries it, return it in a response header, and forward it on outbound calls. Micrometer Tracing plus OpenTelemetry does all of this and adds span timing.

**What's the difference between SLF4J and Logback?**
SLF4J is the facade your code calls; Logback (or Log4j2, or `java.util.logging` via a bridge) is the binding that actually writes. Code against the facade so the implementation can change without touching sources.

**Where should validation live?**
At the edge for shape (Bean Validation on request DTOs, giving 400s) and inside the domain for invariants (constructors that refuse invalid state, throwing `IllegalArgumentException`). Both, because the domain is also called from jobs, messaging and tests, not just HTTP.

## Pitfalls

- Returning JPA entities from controllers: lazy-loading exceptions, infinite recursion, and every schema change becomes an API change.
- `log.error("failed: " + ex)` — loses the stack trace. Pass `ex` as the last argument.
- Forgetting `MDC.clear()` in a filter's `finally`: the next request on that pooled thread logs the previous request's id.
- `@JsonFormat` with a timezone on `Instant`; keep wire timestamps in UTC ISO-8601 and let clients format.
- `fail-on-unknown-properties: true` on a public API: every client upgrade becomes a 400 outage.

## Key takeaways

- Prefer records for DTOs; use Lombok selectively (builders, `@Slf4j`), never `@Data` on JPA entities.
- Configure Jackson once (Spring Boot does sensible defaults); map names with annotations, not manual parsing.
- Validate at the boundary with Bean Validation and `@Valid`.
- Log with SLF4J placeholders, at the right level, without secrets or personal data.
- Use structured JSON logs and correlation ids in production.
