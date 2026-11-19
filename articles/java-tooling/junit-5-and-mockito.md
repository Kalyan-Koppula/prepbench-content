---
title: JUnit 5 and Mockito
order: 3
summary: Test structure, assertions, parameterized tests, lifecycle hooks, Mockito stubbing/verification/captors/spies, AssertJ, flaky tests and the pyramid as interviewers describe it.
---

Expect a live-coding round where you write a service with tests, or a review of your tests. JUnit 5 maps closely onto Jest/Vitest; Mockito is `jest.mock` + `jest.fn` with stricter rules. Know the vocabulary, the three or four annotations you'll actually type, and the opinions interviewers probe (mocking too much, flaky tests, what to unit-test vs integration-test).

## Jest to JUnit 5

| Jest / Vitest | JUnit 5 (Jupiter) |
|---|---|
| `describe` | the test class, or `@Nested` inner class |
| `it` / `test` | `@Test` method, `void`, no `static` |
| `beforeEach` / `afterEach` | `@BeforeEach` / `@AfterEach` (new instance per test by default) |
| `beforeAll` | `@BeforeAll` on a `static` method (or `@TestInstance(PER_CLASS)`) |
| `test.each` | `@ParameterizedTest` + a source |
| `test.skip` | `@Disabled("reason")` |
| `expect(x).toBe(y)` | `assertEquals(expected, actual)` — expected first |
| `expect(fn).toThrow()` | `assertThrows(Type.class, () -> fn())` |
| `jest.fn()` | `mock(Type.class)` / `@Mock` |
| `jest.spyOn` | `spy(real)` / `@Spy` |
| `expect(mock).toHaveBeenCalledWith` | `verify(mock).method(args)` |

Dependency: `spring-boot-starter-test` (test scope) brings JUnit Jupiter, Mockito, AssertJ, Hamcrest and JSONassert. Outside Boot you add `junit-jupiter`, `mockito-junit-jupiter` and `assertj-core` yourself. Surefire picks up classes named `*Test`/`*Tests`.

## Structure and assertions

```java
class PriceCalculatorTest {

    private PriceCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new PriceCalculator(new FixedTaxRate(0.2));
    }

    @Test
    void appliesTaxToNetPrice() {
        Money total = calculator.total(Money.of(100));
        assertEquals(Money.of(120), total);
    }

    @Test
    void rejectsNegativePrices() {
        var ex = assertThrows(IllegalArgumentException.class, () -> calculator.total(Money.of(-1)));
        assertTrue(ex.getMessage().contains("negative"));
    }

    @Test
    void reportsAllFailuresAtOnce() {
        Receipt r = calculator.receipt(Money.of(100));
        assertAll(
            () -> assertEquals(Money.of(100), r.net()),
            () -> assertEquals(Money.of(20), r.tax()),
            () -> assertEquals(Money.of(120), r.gross()));
    }

    @Nested
    class WhenTaxExempt {
        @Test
        void chargesNetOnly() { /* ... */ }
    }
}
```

- JUnit creates a **new instance of the test class for every test method**, so instance fields are per-test state. That's why `@BeforeAll` must be static.
- Name tests as behaviour (`rejectsNegativePrices`), or use `@DisplayName("rejects negative prices")`; Java has no string test names otherwise.
- `assertAll` runs every assertion and reports all failures; plain sequential asserts stop at the first.
- `@Timeout(5)` fails slow tests; `assertTimeoutPreemptively` for one block.
- `@TempDir Path dir` injects a temporary directory that's cleaned up for you.

## AssertJ

Boot ships it, and everyone uses it because the fluent API reads better and the failure messages are good:

```java
assertThat(order.lines()).hasSize(2).extracting(Line::sku).containsExactly("A1", "B2");
assertThat(user).isNotNull().extracting(User::email).isEqualTo("a@b.c");
assertThat(map).containsEntry("k", 1).doesNotContainKey("z");
assertThatThrownBy(() -> service.place(null))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("order");
assertThat(bigDecimal).isEqualByComparingTo("10.00");   // not equals(): scale matters there
assertThat(record).usingRecursiveComparison().isEqualTo(expected);
```

## Parameterized tests

```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "\t"})
void rejectsBlankNames(String name) {
    assertThrows(IllegalArgumentException.class, () -> new User(name));
}

@ParameterizedTest(name = "{0} -> {1}")
@CsvSource({ "1, 1", "2, 1", "3, 2", "10, 55" })
void fibonacci(int n, long expected) {
    assertEquals(expected, Fib.of(n));
}

@ParameterizedTest
@MethodSource("ranges")
void clampsIntoRange(int input, int lo, int hi, int expected) { /* ... */ }

static Stream<Arguments> ranges() {
    return Stream.of(arguments(5, 0, 10, 5), arguments(-1, 0, 10, 0), arguments(99, 0, 10, 10));
}

@ParameterizedTest
@EnumSource(value = Status.class, names = {"PAID", "SHIPPED"})
void isFinal(Status s) { assertTrue(s.isFinal()); }

@ParameterizedTest
@NullAndEmptySource
void handlesNullAndEmpty(String s) { /* ... */ }
```

## Mockito

Use mocks for collaborators that are slow, non-deterministic or external (HTTP clients, repositories, clocks). Don't mock value objects or the class under test.

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository repo;
    @Mock PaymentGateway payments;
    @Captor ArgumentCaptor<Order> orderCaptor;
    @InjectMocks OrderService service;      // constructor injection of the mocks above

    @Test
    void chargesAndSavesOrder() {
        when(payments.charge(any(Money.class))).thenReturn(new PaymentId("p1"));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));   // echo the argument

        Order result = service.place(new Cart(Money.of(50)));

        verify(payments).charge(Money.of(50));
        verify(repo).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().paymentId()).isEqualTo(new PaymentId("p1"));
        assertThat(result.status()).isEqualTo(Status.PAID);
        verifyNoMoreInteractions(payments);
    }

    @Test
    void doesNotSaveWhenPaymentFails() {
        when(payments.charge(any())).thenThrow(new PaymentDeclined());

        assertThrows(PaymentDeclined.class, () -> service.place(new Cart(Money.of(50))));

        verify(repo, never()).save(any());
    }
}
```

Grammar you need:

| Need | Code |
|---|---|
| stub return | `when(m.f(x)).thenReturn(v)`; chain `.thenReturn(a, b)` for successive calls |
| stub void / spy safely | `doThrow(ex).when(m).f(x)`, `doNothing().when(spy).f()`, `doReturn(v).when(spy).g()` |
| compute result | `thenAnswer(inv -> ...)` |
| matchers | `any()`, `any(Type.class)`, `eq(v)`, `anyString()`, `argThat(o -> o.id() > 0)`; **all args must be matchers or none** |
| verify count | `verify(m, times(2))`, `never()`, `atLeastOnce()`; `verify(m, timeout(500))` for async |
| order | `InOrder in = inOrder(a, b); in.verify(a).x(); in.verify(b).y();` |
| capture | `ArgumentCaptor<T>` via `@Captor` or `ArgumentCaptor.forClass` |
| static methods | `try (var s = mockStatic(Clock.class)) { ... }` — a smell; inject a `Clock` instead |

- `@InjectMocks` tries constructor injection first (largest constructor), then setters, then fields. If your class has one constructor, it just works; if injection silently fails you get `null` fields — many people prefer `new OrderService(repo, payments)` explicitly in `@BeforeEach`.
- The extension enables **strict stubs**: an unused `when(...)` fails the test with `UnnecessaryStubbingException`. That's a feature; delete the stub or use `lenient()`.
- Unstubbed methods return "empty" defaults: `null`, `0`, `false`, empty collections, empty `Optional`. A `NullPointerException` deep in your service usually means a missing stub.
- Mockito 5 uses the inline mock maker by default, so final classes and records can be mocked. You still shouldn't mock records.
- A **spy** wraps a real object: real methods run unless stubbed. Use `doReturn(...).when(spy).method()` — the `when(spy.method())` form calls the real method first.

## Flaky tests

Interviewers ask "what makes a test flaky and how do you fix it?" because flakiness is the top complaint in real suites. Causes, with the fix:

- Time: `LocalDate.now()` inside the code. Inject a `Clock` and pass `Clock.fixed(...)` in tests.
- Randomness: seed it or inject a `Random`.
- Order dependence and shared state: static mutable fields, a shared DB row. JUnit's per-method instance helps; `@TestMethodOrder` is a crutch, not a fix.
- Concurrency: asserting right after starting an async task. Use `Awaitility` (`await().atMost(2, SECONDS).until(...)`) or Mockito `timeout()`, never `Thread.sleep`.
- Real network, real ports, real filesystem: mock, WireMock, `@TempDir`, random ports.
- Map iteration order: `HashMap` and `Set.of` have no order; assert with `containsExactlyInAnyOrder`.
- Test pollution in Spring: a `@MockitoBean` or `@DirtiesContext` that changes the cached context for everyone else.

## The pyramid, as interviewers say it

```text
        /  E2E  \        few: full stack, real browser/API, slow, brittle
       / integr. \      some: real DB (Testcontainers), real HTTP layer (MockMvc), one slice at a time
      /   unit    \     many: pure logic, mocks at the boundary, milliseconds
```

The model answer: unit-test domain logic exhaustively with no Spring; test the web layer with `@WebMvcTest` and the persistence layer with `@DataJpaTest` + Testcontainers; keep one or two `@SpringBootTest` happy-path tests to prove wiring; push journeys to a thin E2E suite. If a unit test needs five mocks, the class has too many collaborators — that's a design signal, not a mocking problem. Mention contract tests (Pact, Spring Cloud Contract) if the role is microservices-heavy.

## Worked example: testing a service with a mocked dependency

```java
class TransferService {
    private final AccountRepository accounts;
    private final Clock clock;

    TransferService(AccountRepository accounts, Clock clock) {
        this.accounts = accounts;
        this.clock = clock;
    }

    Transfer transfer(long fromId, long toId, BigDecimal amount) {
        Account from = accounts.findById(fromId).orElseThrow(() -> new NotFoundException("account " + fromId));
        Account to = accounts.findById(toId).orElseThrow(() -> new NotFoundException("account " + toId));
        if (from.balance().compareTo(amount) < 0) throw new InsufficientFundsException(fromId);
        accounts.save(from.withBalance(from.balance().subtract(amount)));
        accounts.save(to.withBalance(to.balance().add(amount)));
        return new Transfer(fromId, toId, amount, Instant.now(clock));
    }
}

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {
    @Mock AccountRepository accounts;
    Clock clock = Clock.fixed(Instant.parse("2025-01-01T00:00:00Z"), ZoneOffset.UTC);
    TransferService service;

    @BeforeEach
    void setUp() { service = new TransferService(accounts, clock); }

    @Test
    void movesMoneyBetweenAccounts() {
        when(accounts.findById(1L)).thenReturn(Optional.of(new Account(1L, new BigDecimal("100"))));
        when(accounts.findById(2L)).thenReturn(Optional.of(new Account(2L, new BigDecimal("5"))));

        Transfer t = service.transfer(1L, 2L, new BigDecimal("30"));

        ArgumentCaptor<Account> saved = ArgumentCaptor.forClass(Account.class);
        verify(accounts, times(2)).save(saved.capture());
        assertThat(saved.getAllValues())
            .extracting(Account::balance)
            .containsExactly(new BigDecimal("70"), new BigDecimal("35"));
        assertThat(t.at()).isEqualTo(Instant.parse("2025-01-01T00:00:00Z"));
    }

    @Test
    void rejectsInsufficientFunds() {
        when(accounts.findById(1L)).thenReturn(Optional.of(new Account(1L, new BigDecimal("10"))));
        when(accounts.findById(2L)).thenReturn(Optional.of(new Account(2L, BigDecimal.ZERO)));

        assertThatThrownBy(() -> service.transfer(1L, 2L, new BigDecimal("30")))
            .isInstanceOf(InsufficientFundsException.class);
        verify(accounts, never()).save(any());
    }
}
```

What makes these tests good: constructor injection makes the service trivially testable; the `Clock` is injected so time is deterministic; each test checks one behaviour with arrange, act, assert; `ArgumentCaptor` checks what was saved rather than how many internal calls happened; and the failure test verifies that **nothing** was saved. With `MockitoExtension`'s strict stubs, an unused `when(...)` fails the test, which keeps stubbing honest.

## Common interview questions

**Why does JUnit create a new test class instance per method?**
Isolation: instance fields reset for every test, so one test can't leak state into another. The cost is that expensive fixtures need `@BeforeAll` (static) or `@TestInstance(PER_CLASS)`.

**Mock vs spy vs stub?**
A mock is a fake whose every method returns defaults until stubbed; a spy wraps a real object and only overrides what you stub; "stub" is the act of programming a return value. In practice: mock interfaces at boundaries, spy sparingly for legacy code, and prefer fakes (in-memory implementations) when behaviour matters.

**When would you not mock?**
Value objects, the class under test, anything cheap and deterministic, and anything whose real behaviour is the point of the test (JSON mapping, SQL). Over-mocking produces tests that pass while the system is broken and break while the system works.

**What is `UnnecessaryStubbingException` telling you?**
A `when(...)` was never hit, so either the test is asserting less than you think or the setup is copy-pasted. Strict stubs keep tests honest; `lenient()` is the escape hatch for shared setup.

**How do you test code that uses the current time?**
Inject `java.time.Clock` and call `Instant.now(clock)`. Tests pass `Clock.fixed(...)`; production passes `Clock.systemUTC()`. Same answer for randomness and UUIDs.

**How do you test a method that calls a private method?**
Through the public method. If the private logic is complex enough to need its own tests, extract it into a class with a public API. Reflection or `@VisibleForTesting` is a last resort.

**Why `assertEquals(expected, actual)` in that order?**
Only for the failure message: "expected `<120> but was <100>`". Swapping them makes diagnoses misleading. AssertJ's `assertThat(actual).isEqualTo(expected)` avoids the question.

**How would you test an `@Async` or scheduled method?**
Unit-test the body synchronously by calling it directly. For the async wiring, use `Awaitility` or `verify(mock, timeout(1000))` in an integration test, or replace the executor with a synchronous one in a test configuration.

## Pitfalls

- Mixing a raw value with a matcher: `when(m.f("x", any()))` throws `InvalidUseOfMatchersException`; write `eq("x")`.
- `@Test` on a `private` or `static` method: silently not run.
- Asserting with `==` on `Integer` or `String`; use `equals`-based assertions.
- Stubbing `repo.findById(1L)` while the code calls `findById(1)`: `int` autoboxes to `Integer`, which doesn't equal `Long`; stub never matches.
- Expecting `@BeforeEach` state to survive across tests, or `@AfterAll` to be non-static.

## Key takeaways

- JUnit 5 structures tests with `@Test`, lifecycle hooks, `@Nested`, `@DisplayName` and parameterised tests.
- AssertJ gives fluent, readable assertions with good failure messages.
- Mock only what you own at boundaries; inject collaborators and clocks through constructors.
- Verify outcomes and important interactions, not every internal call.
- Fix flaky tests at the cause: time, order, shared state, concurrency.
