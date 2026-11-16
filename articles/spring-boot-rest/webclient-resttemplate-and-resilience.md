---
title: RestClient, WebClient and Resilience
order: 6
summary: Calling other services with RestClient (and WebClient), timeouts, retries, circuit breakers with Resilience4j, and when WebFlux is worth it versus the virtual-threads answer.
---

Every service calls other services, and the interview question is rarely "how do you make an HTTP call" but "what happens when the other service is slow". Know the current client API, where each timeout lives, how retries and circuit breakers compose, and have an opinion on reactive vs virtual threads.

## Three clients

| Client | Style | Status in Boot 3.5 |
|---|---|---|
| `RestTemplate` | blocking, template methods (`getForObject`) | maintenance mode; still everywhere in older code |
| `RestClient` | blocking, fluent (Spring 6.1 / Boot 3.2+) | the default for MVC apps |
| `WebClient` | non-blocking, reactive (`Mono`/`Flux`), needs `spring-webflux` | for WebFlux apps or streaming |

Plus **HTTP interface clients**: declare an interface with `@GetExchange`/`@PostExchange` and let Spring generate the implementation over any of the above (`HttpServiceProxyFactory`; Spring Framework 7 / Boot 4 add `@ImportHttpServices` to register them as beans in one line).

## `RestClient`

Boot auto-configures a `RestClient.Builder` with the app's Jackson, observability and configured request factory. Build one client per downstream service:

```java
@Configuration
public class PaymentsClientConfig {
    @Bean
    RestClient paymentsRestClient(RestClient.Builder builder, PaymentsProps props) {
        return builder
            .baseUrl(props.baseUrl())
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .requestInterceptor((req, body, exec) -> {            // e.g. propagate auth / correlation id
                req.getHeaders().set("X-Request-Id", MDC.get("requestId"));
                return exec.execute(req, body);
            })
            .build();
    }
}

@Service
public class PaymentsClient {
    private final RestClient client;
    public PaymentsClient(RestClient paymentsRestClient) { this.client = paymentsRestClient; }

    public PaymentResult charge(ChargeRequest req) {
        return client.post()
            .uri("/charges")
            .contentType(MediaType.APPLICATION_JSON)
            .body(req)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                throw new PaymentRejected(response.getStatusCode(), readProblem(response));
            })
            .body(PaymentResult.class);
    }

    public Optional<Payment> find(String id) {
        ResponseEntity<Payment> res = client.get().uri("/charges/{id}", id).retrieve().toEntity(Payment.class);
        return Optional.ofNullable(res.getBody());
    }
}
```

- `retrieve()` throws `HttpClientErrorException` / `HttpServerErrorException` (subclasses of `RestClientResponseException`) on 4xx/5xx unless you install `onStatus` handlers. `exchange((req, res) -> ...)` gives full control.
- Generic bodies: `.body(new ParameterizedTypeReference<List<Payment>>() {})`.
- The underlying `ClientHttpRequestFactory` is chosen from the classpath: Apache HttpClient 5, Jetty, Reactor Netty, then the JDK `HttpClient`, then `SimpleClientHttpRequestFactory` (`HttpURLConnection`). Add `httpclient5` to get connection pooling; the simple factory has none.

## Timeouts

Every outbound call needs **connect** and **read** timeouts, otherwise a hung dependency hangs your request threads (and with 200 Tomcat threads and no timeouts, the whole service, in about a minute).

```yaml
spring:
  http:
    client:
      connect-timeout: 2s        # Boot 3.4+: applies to the auto-configured RestClient.Builder / RestTemplateBuilder
      read-timeout: 5s
      factory: http-components   # or jdk, jetty, reactor, simple
```

```java
// per client, Boot 3.4+
ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
    .withConnectTimeout(Duration.ofSeconds(1)).withReadTimeout(Duration.ofSeconds(3));
builder.requestFactory(ClientHttpRequestFactoryBuilder.httpComponents().build(settings));
```

- Connect timeout: TCP handshake; short (1–2 s). Read timeout: time between bytes, in practice "how long we wait for the response"; set from the dependency's p99 plus margin, not from hope.
- Connection pool limits (`maxTotal`, `defaultMaxPerRoute` in Apache) are the third knob; a pool of 20 to a slow service makes the 21st caller queue.
- Budget timeouts down the chain: if your SLA is 1 s, a downstream read timeout of 5 s is meaningless. Propagate a deadline when you can.
- Boot 4 moves these to `spring.http.clients.*` and adds per-group blocks for HTTP interface clients under `spring.http.serviceclient.<group>.*`; same ideas.

## Retries

Retry only **idempotent** calls (`GET`, `PUT`, `DELETE`, `POST` with an idempotency key), only on **transient** failures (connect timeout, 503, 429 with `Retry-After`, connection reset), a small number of times, with **exponential backoff and jitter**, and never inside a database transaction.

```java
// Spring Retry (spring-retry + spring-boot-starter-aop, @EnableRetry) — Boot 3.x
@Retryable(retryFor = TransientPaymentsException.class, maxAttempts = 3,
           backoff = @Backoff(delay = 200, multiplier = 2, random = true))
public PaymentResult charge(ChargeRequest req) { ... }

@Recover
PaymentResult fallback(TransientPaymentsException ex, ChargeRequest req) { throw new PaymentsUnavailable(ex); }
```

Spring Framework 7 / Boot 4 builds this in: `@EnableResilientMethods` with `@Retryable` and `@ConcurrencyLimit` from `org.springframework.resilience`, plus a `RetryTemplate` in core, so the separate Spring Retry library is no longer needed. Either way it's a proxy, with the self-invocation rule. Resilience4j's `@Retry` is the other common choice.

Retry storms: three services each retrying three times turn one failure into 27 requests at the bottom. That's why retries are paired with a circuit breaker and a budget.

## Circuit breaker in a paragraph

A circuit breaker tracks the failure rate of calls to a dependency over a sliding window; when it exceeds a threshold (say 50% of the last 20 calls, or slow calls over 2 s) the breaker **opens** and calls fail immediately with `CallNotPermittedException` for a wait period, so your threads aren't tied up and the dependency gets room to recover; after the wait it goes **half-open**, lets a few trial calls through, and **closes** again if they succeed. With Resilience4j in Boot (`resilience4j-spring-boot3` + AOP), that is `@CircuitBreaker(name = "payments", fallbackMethod = "chargeFallback")` on the client method, configuration under `resilience4j.circuitbreaker.instances.payments.*` (`slidingWindowSize`, `failureRateThreshold`, `waitDurationInOpenState`, `slowCallDurationThreshold`), state exposed in Actuator health and metrics, and the aspect order `Retry(CircuitBreaker(RateLimiter(TimeLimiter(Bulkhead(method)))))` so retries happen outside the breaker. The fallback returns a degraded answer (cached data, "unknown", a queued job) — it should never be a silent success. Bulkheads (a semaphore or thread pool per dependency) stop one slow dependency from consuming every Tomcat thread; the pattern goes back to Hystrix, which is retired.

## `WebClient` and when WebFlux is worth it

```java
WebClient client = WebClient.builder().baseUrl(props.baseUrl()).build();

Mono<Payment> p = client.get().uri("/charges/{id}", id)
    .retrieve()
    .onStatus(HttpStatusCode::is5xxServerError, res -> Mono.error(new PaymentsUnavailable()))
    .bodyToMono(Payment.class)
    .timeout(Duration.ofSeconds(3))
    .retryWhen(Retry.backoff(3, Duration.ofMillis(200)).jitter(0.5));

// in an MVC app you'd end with p.block(); at which point RestClient was the simpler tool
Flux<Event> stream = client.get().uri("/events").accept(MediaType.TEXT_EVENT_STREAM).retrieve().bodyToFlux(Event.class);
```

WebFlux (Reactor, Netty, `Mono`/`Flux`) is the non-blocking stack: a few event-loop threads handle thousands of concurrent connections, like Node. It earns its complexity when:

- the whole call chain is non-blocking (R2DBC or reactive Mongo, reactive messaging, no JDBC) — one blocking call on an event loop breaks the model;
- the service is an I/O-bound gateway/aggregator fanning out to many downstreams, or streams (SSE, WebSockets, backpressured pipelines);
- you need backpressure semantics end-to-end.

The costs: stack traces that say nothing, debugging through operators, a different transaction/security model, `ThreadLocal`-based tools (MDC, `@Transactional`) not working as expected, and every library having to be reactive.

The Java 21 answer: in a Boot MVC app, `spring.threads.virtual.enabled=true` puts each request on a virtual thread, so blocking `RestClient` and JDBC calls park cheaply and you get WebFlux-like concurrency with ordinary imperative code, exceptions and debuggers. The remaining limits are real: connection pools, downstream capacity, and `synchronized` blocks pinning carriers on Java 21–23 (fixed in Java 24). Say: "I'd default to MVC with virtual threads and `RestClient`, and reach for WebFlux for streaming or when the whole stack is reactive."

## Common interview questions

**Which HTTP client would you use in a new Spring Boot service and why?**
`RestClient`: Boot auto-configures a builder with Jackson and tracing, it's blocking and simple, and with virtual threads blocking is cheap. `WebClient` only in a WebFlux app or for streaming; `RestTemplate` only in existing code.

**What timeouts do you set on outbound calls and how do you pick values?**
Connect (short, 1–2 s) and read (from the dependency's p99 plus margin, bounded by your own SLA), plus a connection-pool cap per host. Without them a slow dependency consumes every request thread and the outage spreads upstream.

**When is it safe to retry a request?**
When the operation is idempotent (or protected by an idempotency key) and the failure is transient — connect timeout, 503, 429, reset. Few attempts, exponential backoff with jitter, respect `Retry-After`, and never retry 4xx validation errors or inside a DB transaction.

**Explain a circuit breaker and how it differs from a retry.**
A retry handles one failed call by trying again; a breaker looks at the failure rate across calls and, when the dependency is clearly unhealthy, stops calling it for a while so you fail fast and let it recover, then probes with a few calls. Retries go outside the breaker so they don't hammer an open circuit.

**What does a fallback return?**
A degraded but honest result: cached or default data, a "temporarily unavailable" error mapped to 503, or an accepted-for-later response with the work queued. Returning a fake success hides the outage and corrupts data.

**When would you choose WebFlux over MVC?**
For I/O-bound fan-out gateways, streaming responses, or when the full stack is reactive and backpressure matters. For a typical CRUD/API service MVC with virtual threads gives similar throughput with a simpler model, so I'd choose that by default.

**What's the virtual-threads story with Spring?**
Boot 3.2+ on Java 21: `spring.threads.virtual.enabled=true` runs Tomcat requests, `@Async` and schedulers on virtual threads. Blocking I/O no longer costs a platform thread, so thread-per-request scales. Pools and pinning are the remaining limits; the programming model is unchanged.

**How do you propagate a correlation id or auth token to downstream calls?**
A `ClientHttpRequestInterceptor` on the `RestClient.Builder` that copies from MDC or the security context into headers. With Micrometer Tracing the trace context is injected automatically.

## Pitfalls

- A `RestClient` built with `RestClient.create()` instead of the Boot `Builder`: no tracing, no configured timeouts, no Jackson customisations.
- Infinite read timeout because the factory default is 0: the `SimpleClientHttpRequestFactory` and JDK client both wait forever unless told otherwise.
- `block()` on a `WebClient` call inside a WebFlux handler: `IllegalStateException` or a dead event loop.
- Retrying a `POST` that charged a card.
- A circuit breaker whose fallback hits the same dependency.
