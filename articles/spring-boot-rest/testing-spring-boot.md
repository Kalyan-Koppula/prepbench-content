---
title: Testing Spring Boot
order: 5
summary: "@WebMvcTest with MockMvc, @MockitoBean, @SpringBootTest with TestRestTemplate/WebTestClient, slices, test configuration, Testcontainers, and what to test at which level."
---

Interviewers ask "how do you test a Spring Boot service?" to check that you know the layers (unit, slice, full context, containers), what each one loads, and that you don't spin up the whole app for every test. Expect a follow-up on how to replace a bean with a mock and on why integration tests get slow.

## The ladder

| Level | Annotation | Loads | Speed | Tests |
|---|---|---|---|---|
| Unit | none (JUnit + Mockito) | nothing from Spring | ms | domain logic, services with mocked collaborators |
| Web slice | `@WebMvcTest(XController.class)` | MVC infra, that controller, `@ControllerAdvice`, filters, converters, Security config; **not** services/repos | ~1 s once | routing, binding, validation, status codes, JSON shape, error format, auth rules |
| Persistence slice | `@DataJpaTest` | JPA, repositories, embedded DB (or Testcontainers) | ~2 s | queries, mappings, constraints |
| JSON slice | `@JsonTest` | Jackson only | ms | serialisation of DTOs |
| Client slice | `@RestClientTest(XClient.class)` | the client + `MockRestServiceServer` | ms | outbound call mapping and error handling |
| Full context | `@SpringBootTest` | everything | seconds | wiring, end-to-end happy paths, security + persistence together |

The context is **cached** across test classes with identical configuration (same annotations, same `@MockitoBean` set, same properties). Mixing many different configurations creates many contexts and the suite crawls; standardise a few.

## `@WebMvcTest` + `MockMvc`

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean UserService users;              // Boot 3.4+; replaces @MockBean (deprecated 3.4, removed in Boot 4)

    @Test
    void returnsUser() throws Exception {
        when(users.get(7L)).thenReturn(new User(7L, "ann@acme.com", "Ann"));

        mvc.perform(get("/api/users/{id}", 7).accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.email").value("ann@acme.com"))
           .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void rejectsInvalidBody() throws Exception {
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "not-an-email", "name": ""}
                        """))
           .andExpect(status().isBadRequest())
           .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
           .andExpect(jsonPath("$.errors.length()").value(2));

        verifyNoInteractions(users);
    }

    @Test
    void mapsNotFound() throws Exception {
        when(users.get(99L)).thenThrow(new NotFoundException("user", 99));
        mvc.perform(get("/api/users/99")).andExpect(status().isNotFound());
    }
}
```

- `MockMvc` runs the real `DispatcherServlet` pipeline in-process without a socket: filters, mapping, validation, advice, Jackson. It is not a mock of MVC.
- With Spring Security on the classpath the slice applies your `SecurityFilterChain`; use `spring-security-test`: `.with(jwt())`, `.with(user("ann").roles("ADMIN"))`, `@WithMockUser`, and `.with(csrf())` for state-changing requests.
- `@MockitoBean` replaces (or adds) a bean in the test context with a Mockito mock; `@MockitoSpyBean` wraps the real one. Each distinct set of mocked beans is a different context cache key.
- Boot 3.4+ also ships `MockMvcTester`, an AssertJ-style API: `assertThat(mvc.get().uri("/api/users/7")).hasStatusOk().bodyJson().extractingPath("$.email").isEqualTo("ann@acme.com")`.

## `@SpringBootTest`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrdersApiIT {

    @Container
    @ServiceConnection                                   // Boot 3.1+: wires spring.datasource.* from the container
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired TestRestTemplate rest;                    // real HTTP against the random port
    @LocalServerPort int port;

    @Test
    void placesAnOrder() {
        var res = rest.postForEntity("/api/orders", new CreateOrderRequest(1L, List.of(new LineRequest("A1", 2))), OrderResponse.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(res.getHeaders().getLocation()).isNotNull();
        assertThat(res.getBody().status()).isEqualTo("PAID");
    }
}
```

- `webEnvironment`: `MOCK` (default; use `MockMvc`, no server), `RANDOM_PORT` / `DEFINED_PORT` (real Tomcat, use `TestRestTemplate` or `WebTestClient`), `NONE`.
- `TestRestTemplate` is the classic client for `RANDOM_PORT` (never throws on 4xx/5xx; comes with Basic auth helpers). `WebTestClient` has the nicer fluent API and works against both a live server and `MockMvc`, but needs `spring-webflux` on the test classpath. Spring Framework 7 adds `RestTestClient` with the same fluent API on top of `RestClient`, no WebFlux needed.
- `@Transactional` on a test class rolls back each test; convenient, but it hides commit-time behaviour (constraints, `AFTER_COMMIT` listeners) and doesn't apply across HTTP to a real server. Prefer explicit cleanup or `@Sql` scripts for `RANDOM_PORT` tests.
- `@DirtiesContext` throws away the cached context; a last resort when a test mutates shared singletons.

## Test configuration

```java
@SpringBootTest
@ActiveProfiles("test")                                   // application-test.yml
@TestPropertySource(properties = "acme.payments.retries=0")
@Import(FakeClockConfig.class)                            // extra beans for this test
class CheckoutServiceIT {

    @TestConfiguration                                    // not picked up by scanning; only via @Import or nesting
    static class FakeClockConfig {
        @Bean @Primary Clock clock() { return Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC); }
    }

    @DynamicPropertySource                                // properties computed at runtime (container ports, WireMock URLs)
    static void props(DynamicPropertyRegistry r) {
        r.add("acme.payments.base-url", () -> "http://localhost:" + wireMock.port());
    }
}
```

Static nested `@TestConfiguration` classes are auto-detected by the enclosing test; top-level ones need `@Import`. Put a shared `src/test/java/.../TestcontainersConfiguration.java` with `@ServiceConnection` containers and `@Import` it from every integration test, so they share one container and one context.

## Testcontainers intro

Real Postgres/Kafka/Redis in Docker, started by the test JVM, thrown away afterwards. Replaces H2 ("works in tests, fails on Postgres-specific SQL"). Needs Docker locally and in CI.

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)   // don't swap in H2
@Testcontainers
class OrderRepositoryTest {
    @Container @ServiceConnection
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired OrderRepository orders;
    @Autowired TestEntityManager em;

    @Test
    void findsPaidOrdersNewestFirst() { ... }
}
```

- `static` container = one per test class (reused across methods). For one per JVM, use a singleton pattern or Testcontainers' reuse flag (`testcontainers.reuse.enable=true` in `~/.testcontainers.properties`) and don't annotate with `@Container`.
- `@ServiceConnection` removes the old `@DynamicPropertySource` boilerplate for supported containers (JDBC, Mongo, Redis, Kafka, RabbitMQ, Elasticsearch, …).
- Boot 3.1+ can also run the app locally against containers: a `TestOrdersApplication` main that calls `SpringApplication.from(OrdersApplication::main).with(TestcontainersConfiguration.class).run(args)`, or `spring-boot-docker-compose` for a `compose.yaml`.
- Schema comes from Flyway/Liquibase migrations, same as production — another reason not to use `ddl-auto=create` in tests.

## What to test where

- Domain rules, calculations, state machines: plain unit tests, lots of them, no Spring.
- Each controller: one `@WebMvcTest` covering routing, every validation rule, auth, and the error body. Mock the service.
- Each non-trivial query: `@DataJpaTest` against the real database engine.
- JSON contracts: `@JsonTest` with `JacksonTester` for anything with custom naming or polymorphism.
- Outbound clients: `@RestClientTest` + `MockRestServiceServer`, or WireMock for timeouts and retries.
- A few `@SpringBootTest` journeys: "place order → appears in list → cancel", with Testcontainers; these prove wiring, transactions and security together.
- Contract tests (Spring Cloud Contract / Pact) between services instead of end-to-end environments.

Say "I avoid `@SpringBootTest` for things a slice can test, because every distinct context costs seconds and the suite's runtime is what kills the feedback loop".

## Worked example: one feature, three test levels

The feature: `POST /api/projects` creates a project and rejects duplicate names.

**1. Unit test of the service** (no Spring, milliseconds):

```java
@Test
void rejectsDuplicateNames() {
    var repo = mock(ProjectRepository.class);
    when(repo.existsByNameIgnoreCase("Apollo")).thenReturn(true);
    var service = new ProjectService(repo);

    assertThatThrownBy(() -> service.create(new CreateProject("Apollo", null)))
        .isInstanceOf(DuplicateNameException.class);
}
```

**2. Web slice test** (MVC layer only, mocked service): checks HTTP mapping, validation and error format.

```java
@WebMvcTest(ProjectController.class)
class ProjectControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ProjectService projects;

    @Test
    void returns409ForDuplicates() throws Exception {
        when(projects.create(any())).thenThrow(new DuplicateNameException("Apollo"));

        mvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "Apollo"}
                    """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.title").value("Duplicate name"));
    }

    @Test
    void returns400ForBlankName() throws Exception {
        mvc.perform(post("/api/projects").contentType(MediaType.APPLICATION_JSON).content("{\"name\": \"\"}"))
            .andExpect(status().isBadRequest());
    }
}
```

**3. Integration test** (full context, real PostgreSQL in a container): checks the unique constraint and the whole path.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ProjectApiIT {
    @Container @ServiceConnection
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:17");

    @Autowired TestRestTemplate http;

    @Test
    void createsThenRejectsDuplicate() {
        var first = http.postForEntity("/api/projects", Map.of("name", "Apollo"), String.class);
        var second = http.postForEntity("/api/projects", Map.of("name", "apollo"), String.class);
        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }
}
```

Each level catches different bugs: business rules (unit), HTTP contract and validation (slice), and wiring, SQL and constraints (integration). Most tests should be at the first two levels; keep a few integration tests for the critical paths. `@ServiceConnection` (Boot 3.1+) wires the container's URL and credentials into the datasource automatically.

## Common interview questions

**What does `@WebMvcTest` load and what doesn't it?**
The MVC layer: the named controllers, `@ControllerAdvice`, filters, interceptors, converters, validation, and Security config. Not `@Service`, `@Repository`, `@Component` beans — you supply those with `@MockitoBean`. It runs the real request pipeline through `MockMvc` without a port.

**`@MockBean` vs `@MockitoBean`?**
Same purpose: replace a bean in the test context with a Mockito mock. `@MockBean` is Boot's original; Spring Framework 6.2 moved the feature into the framework as `@MockitoBean`/`@MockitoSpyBean`, Boot 3.4 deprecated the old one and Boot 4 removed it. Both change the context cache key.

**Why is the integration test suite slow and how do you fix it?**
Usually many distinct application contexts (different mocks, properties or profiles per class) each taking seconds to start, plus per-class containers. Standardise test configurations so the cache hits, share containers with a singleton or `@ServiceConnection` config, push logic down to slices and unit tests.

**`MockMvc` vs `TestRestTemplate`/`WebTestClient`?**
`MockMvc` calls the DispatcherServlet in-process: fast, no port, full MVC behaviour but no real Tomcat (no real HTTP, no servlet container specifics). `TestRestTemplate`/`WebTestClient` with `RANDOM_PORT` go over real HTTP including the server and serialisation on both ends; use them for a few end-to-end checks.

**How do you test with a real database?**
Testcontainers: a `PostgreSQLContainer` started once per class or JVM, wired with `@ServiceConnection`, schema from the same Flyway migrations as production. `@DataJpaTest` with `replace = NONE` for repositories; `@SpringBootTest` for journeys.

**How do you test security rules on endpoints?**
In a `@WebMvcTest` with `spring-security-test`: `@WithMockUser(roles = "ADMIN")` or `.with(jwt().authorities(...))` on the request, asserting 200 vs 401 vs 403 per role. The security filter chain is part of the slice.

**How would you test code that depends on the current time or a third-party HTTP API?**
Override the `Clock` bean with `Clock.fixed` via a `@TestConfiguration` with `@Primary`; stub the HTTP API with `MockRestServiceServer` (`@RestClientTest`) or WireMock, pointing the client's base URL at it through `@DynamicPropertySource`.

## Pitfalls

- `@SpringBootTest` on a test that only needs a controller: slow and brittle for no gain.
- Forgetting `@AutoConfigureTestDatabase(replace = NONE)`: `@DataJpaTest` silently swaps your Postgres container for H2 if it's on the classpath.
- `@MockitoBean` on a bean the controller doesn't use "just in case": a new context for that class.
- Testing JSON with string equality: field order and whitespace are not the contract; use `jsonPath` or JSONassert lenient mode.
- `@Transactional` on a `RANDOM_PORT` test: the HTTP request runs in Tomcat's thread, outside the test's transaction; nothing is rolled back.

## Key takeaways

- Test at three levels: plain unit tests, slice tests (`@WebMvcTest`, `@DataJpaTest`), and a few full integration tests.
- Slices load only part of the context, so they start quickly and isolate the layer.
- Use Testcontainers with `@ServiceConnection` for real databases instead of H2.
- Mock collaborators with `@MockitoBean` in slices; avoid mocking in integration tests.
- Assert on HTTP status and response bodies, not just that "no exception was thrown".
