---
title: Spring Boot Anatomy
order: 1
summary: Starters, @SpringBootApplication, auto-configuration, embedded Tomcat, and the exact path of a request from socket to controller and back — plus Boot 3 vs 4 in two sentences.
---

"What happens when a request hits your Spring Boot app?" is the Java equivalent of "what happens when you type a URL". The expected answer names the thread model, the servlet filter chain, `DispatcherServlet`, handler mapping, argument resolution, message converters and exception resolution, in order. This article is that answer, with the surrounding anatomy.

## What Boot adds to Spring

Spring Framework is the container, MVC, transactions, etc. Spring Boot is the opinionated assembly: starters that bring compatible dependencies, auto-configuration that creates the beans those dependencies imply, an embedded server so the jar runs itself, externalised configuration, and Actuator for operations. You could build the same app on plain Spring with a few hundred lines of config; Boot makes that the default.

```java
@SpringBootApplication     // = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan
public class OrdersApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrdersApplication.class, args);
    }
}
```

`@ComponentScan` starts at this class's package, which is why the main class sits at the root package. `@EnableAutoConfiguration` reads the `AutoConfiguration.imports` lists from every jar and applies the conditional configurations after yours (see the configuration article).

Starters you'll name: `spring-boot-starter-web` (MVC + Tomcat + Jackson; `spring-boot-starter-webmvc` in Boot 4), `-validation`, `-data-jpa`, `-security`, `-actuator`, `-test`, `-webflux`, `-oauth2-resource-server`, `-cache`.

## The embedded server

`spring-boot-starter-web` includes Tomcat; swap for Jetty or Undertow by excluding it and adding the other starter. Boot creates a `TomcatServletWebServerFactory`, registers `DispatcherServlet` at `/`, registers every `Filter` bean, and starts the connector on `server.port` during context refresh.

Thread model: Tomcat accepts connections with NIO and hands each request to a worker thread from a pool (`server.tomcat.threads.max`, default 200; `threads.min-spare` 10). A request **occupies that thread until the response is written**, including while it waits on the database or a downstream HTTP call. That's the thread-per-request model, the source of every "Spring doesn't scale like Node" conversation, and the reason the Java 21 answer exists:

```yaml
spring:
  threads:
    virtual:
      enabled: true      # Boot 3.2+ on Java 21: Tomcat runs each request on a virtual thread
```

With virtual threads, blocking JDBC or HTTP calls park the virtual thread instead of a platform one, so blocking code gets Node-like concurrency without rewriting to reactive. Mention that pinning (`synchronized` holding a carrier thread) was fixed in Java 24, and that connection pools still bound your real concurrency.

## The request path

```text
socket → Tomcat connector (NIO acceptor + worker thread)
  → Servlet Filter chain (ordered @Component Filter / FilterRegistrationBean beans)
       CharacterEncodingFilter, FormContentFilter, RequestContextFilter
       Spring Security: DelegatingFilterProxy → FilterChainProxy → SecurityFilterChain (authn, authz, CSRF…)
       your OncePerRequestFilter (correlation id, rate limiting, logging)
  → DispatcherServlet.doDispatch
       1. HandlerMapping → RequestMappingHandlerMapping finds the @RequestMapping method (404 if none; 405 for wrong method)
       2. HandlerInterceptor.preHandle for each registered interceptor (can short-circuit)
       3. HandlerAdapter → RequestMappingHandlerAdapter
            argument resolvers: @PathVariable, @RequestParam, @RequestBody (via HttpMessageConverter), @Valid …
            invokes your controller method
            return value handlers: @ResponseBody → HttpMessageConverter (Jackson) writes JSON
       4. HandlerInterceptor.postHandle / afterCompletion
       5. on exception: HandlerExceptionResolver chain
            ExceptionHandlerExceptionResolver (@ExceptionHandler / @ControllerAdvice)
            ResponseStatusExceptionResolver (@ResponseStatus, ResponseStatusException)
            DefaultHandlerExceptionResolver (Spring MVC exceptions → 400/404/405/415…)
  → unhandled or sendError → Boot's /error → BasicErrorController (JSON or whitelabel page)
← response written, thread returned to pool
```

Distinctions interviewers ask for:

- **Filter vs interceptor**: filters are Servlet-level, run for every request including static resources and before security, see raw `HttpServletRequest`; interceptors are Spring MVC-level, run after handler lookup, know which controller method will run, and can access the `ModelAndView`. Cross-cutting that needs the matched handler (auth annotations, timing by endpoint) → interceptor; everything else → filter.
- **Message converters**: `HttpMessageConverter`s turn body ↔ object based on `Content-Type` and `Accept`. Boot registers Jackson (`MappingJackson2HttpMessageConverter` in Boot 3, `JacksonJsonHttpMessageConverter` in Boot 4), String, byte[], form, and XML if Jackson's XML module is present. Content negotiation picks one; no match → 406 (response) or 415 (request).
- **Security** is a filter chain, not an interceptor, so it runs before `DispatcherServlet` and can reject a request without any controller involvement; method security (`@PreAuthorize`) is then an AOP proxy on the bean.
- **Exceptions** thrown from the controller go through resolvers; exceptions from filters (including security) do **not** reach `@ControllerAdvice` — handle them in the filter or via `AuthenticationEntryPoint`/`AccessDeniedHandler`.
- **`/error`**: anything that falls through becomes a forward to Boot's error controller, which produces `{"timestamp","status","error","path"}` with message and stack trace hidden by default (`server.error.include-message`, `include-stacktrace`).

## Startup sequence

1. `SpringApplication.run`: build `Environment` (profiles, property sources), print banner, create the servlet `ApplicationContext`.
2. Register the main class; component scan collects your bean definitions; auto-configuration adds the conditional ones.
3. Refresh: instantiate singletons in dependency order, run post-processors, create proxies, `@PostConstruct`.
4. Create the embedded server, register servlet/filters, start Tomcat.
5. Run `ApplicationRunner`/`CommandLineRunner` beans, publish `ApplicationReadyEvent`, flip readiness.

Typical startup is 2–5 s for a mid-sized service; `--debug` shows auto-configuration decisions; `spring.main.lazy-initialization=true` trades startup time for first-request latency; AOT/CDS and GraalVM native images cut it further.

## Actuator, in case they ask

`spring-boot-starter-actuator` adds operational endpoints under `/actuator`: `health` (with liveness/readiness groups), `info`, `metrics` and `prometheus` (Micrometer), `env`, `configprops`, `beans`, `conditions`, `mappings` (every route and its handler, useful when a URL 404s), `loggers` (change a level at runtime), `threaddump` and `heapdump`. Only `health` is exposed over HTTP by default; expose the rest deliberately, on a separate management port, behind auth.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus, mappings
  server:
    port: 9090
```

## Boot 3 vs Boot 4

Boot 3 (2022–2025) moved to Java 17+, Jakarta EE 9+ (`jakarta.*` packages), Spring Framework 6, Problem Details, observability via Micrometer, virtual-thread support and `RestClient`. Boot 4 (November 2025) sits on Spring Framework 7 and Jackson 3, modularises auto-configuration and starters, adds first-class API versioning and `@ImportHttpServices`, adopts JSpecify null-safety annotations, and removes long-deprecated pieces like `@MockBean`. Code written for 3.5 with current APIs migrates with import changes rather than rewrites.

## Common interview questions

**What does `@SpringBootApplication` do?**
It's three annotations: `@SpringBootConfiguration` (a `@Configuration`), `@EnableAutoConfiguration` (apply the conditional configurations from the classpath), and `@ComponentScan` (scan this package and below). `SpringApplication.run` then builds the context, starts the embedded server and publishes ready events.

**Walk me through a request from Tomcat to the controller.**
A Tomcat worker thread runs the servlet filter chain, including Spring Security, then `DispatcherServlet` asks the handler mapping for the controller method, runs interceptors, resolves arguments (path, query, JSON body via Jackson, validation), invokes the method, converts the return value with a message converter, and routes any exception through `@ControllerAdvice` before the response is written.

**What is a starter?**
A dependency-only POM that pulls in a coherent, version-aligned set of libraries for a feature. Adding `spring-boot-starter-data-jpa` brings Hibernate, Spring Data, the JDBC pool and transaction support; auto-configuration then wires them.

**What is the difference between a Filter and a HandlerInterceptor?**
A Filter is Servlet API, runs before the DispatcherServlet for every request, and wraps the whole chain; an interceptor is Spring MVC, runs around the chosen handler and knows which method matched. Security, encoding, correlation ids are filters; per-endpoint logic is an interceptor or AOP.

**How does Spring MVC handle concurrency?**
One Tomcat thread per in-flight request, from a bounded pool; controllers are singletons and must be stateless. If the thread blocks on I/O it's unavailable. Virtual threads make the blocking cheap; WebFlux removes the blocking entirely at the cost of a reactive programming model.

**Why isn't my `@ControllerAdvice` catching the 401?**
Authentication happens in the security filter chain before any controller is chosen, so the exception never enters the MVC exception resolvers. Customise the `AuthenticationEntryPoint` or add a filter-level handler instead.

**How does Boot choose Jackson over other converters?**
By classpath and content negotiation: Jackson is on the classpath via the web starter, so its converter is registered; for each response Spring matches the `Accept` header against the converters' supported media types in order, and Jackson claims `application/json`.

## Pitfalls

- Moving the main class into a sub-package: components in sibling packages vanish from scanning with no error.
- Registering a `Filter` both as `@Component` and in a `FilterRegistrationBean`: it runs twice. Use one.
- Doing a long blocking call in a controller with a 200-thread pool and expecting Node-like throughput; measure, then enable virtual threads or use async.
- `server.error.include-stacktrace=always` in production: stack traces in API responses.
- Thinking `@Order` on a `@Component` Filter is optional: without it filters run in undefined order relative to each other.
