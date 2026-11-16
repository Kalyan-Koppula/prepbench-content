---
title: Production LLM Concerns
order: 5
summary: Rate limits and backoff, timeouts, idempotency, model fallbacks, cost observability, PII-safe logging, caching layers, structured outputs, A/B and shadow testing, retention and compliance.
---

The "how would you run this in production" follow-up is where senior candidates separate from prompt tinkerers. Nothing here is exotic; it is the same reliability toolkit as any third-party dependency, applied to a dependency that is slow, expensive, non-deterministic and handles user text.

## Rate limits and backoff

- Providers limit requests per minute and input and output tokens per minute, per model, usually with a token-bucket so capacity refills continuously. Anthropic also applies ramp limits on sudden growth, and cache reads do not count toward its input-token limit.
- A limit hit is HTTP 429 with a `retry-after` header (seconds). Honour it; retrying sooner fails again. Anthropic exposes `anthropic-ratelimit-*-remaining` and `-reset` headers so you can slow down before the 429.
- Retry 429, 5xx and connection errors with exponential backoff plus jitter, capped attempts (SDKs default to two retries). Do not retry 400 or 401, and treat a spend-cap 429 (no `retry-after`) as an outage, not a transient.
- Protect the provider from yourself: a client-side concurrency limiter or queue per model, with priority lanes so interactive traffic is not starved by batch jobs. Move anything that is not latency-sensitive to the batch API (lower price, separate limits).

```ts
async function withBackoff<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (e) {
      const status = (e as { status?: number }).status
      const retryable = status === 429 || status === 529 || (status ?? 500) >= 500
      if (!retryable || i === attempts - 1) throw e
      const retryAfter = Number((e as { headers?: Record<string, string> }).headers?.['retry-after'])
      const base = retryAfter ? retryAfter * 1000 : Math.min(30_000, 500 * 2 ** i)
      await new Promise((r) => setTimeout(r, base + Math.random() * 250))
    }
  }
}
```

## Timeouts

- Set them at every layer: provider SDK (per-request), your gateway, the load balancer, the browser. Make the inner timeout shorter than the outer one so you get a real error instead of a severed socket.
- Stream anything that may run long; a non-streaming request with a big `max_tokens` is the classic way to hit a proxy's idle timeout.
- Separate "time to first token" from "total time"; alert on the former for UX, the latter for runaway generations.
- Remember that retries multiply wall-clock: timeout × (retries + 1).

## Idempotency

Generation is not idempotent, so a retried request can produce a second answer, a second tool side effect and a second charge. Build idempotency at your layer:

- Client sends a `clientMessageId`; the server stores it with the conversation and returns the existing result on a duplicate.
- Tool calls that have side effects (send, pay, delete) take an idempotency key derived from the tool-call id, and the tool implementation deduplicates.
- Batch jobs key results by your own `custom_id`, never by position.

## Fallbacks between models and providers

- Define a fallback chain per feature (primary, same-vendor smaller model, other vendor) and trigger on 429, 5xx, 529 overloaded, and timeouts, not on content you dislike.
- Keep tool schemas and prompts portable; test the chain regularly in staging, because a never-exercised fallback is a broken fallback.
- Fallback resets the prompt cache (caches are model-scoped) and may change thinking or feature support, so expect higher cost and latency during failover and flag it in logs.
- Safety refusals are a separate case: Anthropic's newest models return `stop_reason: "refusal"`, and the API can route to a server-side fallback model for you; your own code still needs an answer for "the whole chain refused".

## Cost observability

- Record `usage` from every response: input, output, cache write and cache read tokens, plus model and feature name. Multiply by the price table in your own code; do not trust a mental estimate.
- Attribute cost to a **feature** and a **tenant**: a `feature` tag on every call ("support-assistant", "pr-summary") and a per-feature monthly budget with alerts at 50, 80 and 100%.
- Watch cost per completed task, not per request: a cheaper model that needs more turns is not cheaper.
- Guardrails: `max_tokens` per feature, a per-user daily cap, a per-conversation turn cap, and an iteration cap on agent loops.
- Cheapest wins first: prompt caching, shorter prompts, lower effort or a smaller model on routes that do not need the best one, batch for offline work.

## Logging and tracing without leaking PII

- Trace every request: conversation id, feature, model, prompt version, latency per stage (retrieval, rerank, first token, total), usage and stop reason. OpenTelemetry spans are the standard answer.
- Prompt and response bodies are PII. Default to **not** storing them; where you must (debugging, evals), store a redacted copy (regex plus a PII classifier), encrypt at rest, restrict access, and set a short retention with a separate opt-in for users who agree to help improve the product.
- Hash or tokenise user identifiers in logs; keep the mapping elsewhere.
- Keep secrets out of prompts and tool results that get logged (API keys the model fetches from a tool are a classic leak).
- Sample full transcripts for human review under access control rather than logging everything.

## Caching layers

| Layer | What it saves | Notes |
|---|---|---|
| Prompt cache (provider-side) | Reprocessing a stable prefix | Prefix match; writes cost 1.25x (5-minute TTL) or 2x (1-hour), reads a fraction of base input; verify with `cache_read_input_tokens` |
| Exact response cache | The whole call for identical inputs | Key on a hash of model, prompt version, system, tools and user input; useful for classification and extraction, useless for open chat |
| Semantic response cache | Calls for near-duplicate questions | Embed the question, serve a stored answer above a similarity threshold; risky for anything personalised or time-sensitive |
| Retrieval cache | Embedding the same query, same top-k | Short TTL; invalidate on index update |
| Tool result cache | Repeated tool calls with the same arguments | Per-conversation memoisation with explicit TTL |

Always include the prompt version in cache keys so a prompt change does not serve stale behaviour.

## Structured outputs for reliability

Parsing JSON out of prose is the source of most "it works 95% of the time" bugs. Use the provider's schema-constrained output (Anthropic: `output_config.format` with a JSON schema, or `strict: true` on tool definitions so tool inputs validate against the schema). Still validate on your side with Zod or similar, because a schema cannot express every invariant, and because `max_tokens` can truncate a response. Keep schemas small, use enums for categories, and give a `reason` field when you need the model to explain a decision. Note that citations and structured outputs cannot be combined in one request.

## A/B and shadow testing

- **Offline evals first**: every prompt, model or retrieval change runs against the golden set in CI; ship only if the headline metric holds.
- **Shadow (dark) traffic**: run the candidate in parallel on real requests, discard its output, compare metrics (judge scores, latency, cost, refusal rate) with the live version. No user impact; costs double for the sampled traffic.
- **A/B**: route a percentage of users to the candidate, measure task completion, thumbs, retries, escalation to a human, and cost. Keep assignment sticky per user so conversations stay consistent.
- Version everything in the request log (prompt version, model id, retrieval config) so a metric can be attributed to a change.
- Roll back by configuration, not deploy: prompts and model ids live in config with an instant kill switch.

## Data retention and compliance questions

Expect: "where does our data go, how long is it kept, is it used for training, which region, can we delete it?" Know the answers for your provider:

- **Retention**: per Anthropic's data-retention page, prompts and outputs on the Claude API are not retained by default, with one documented exception: its newest "Covered Models" require 30-day retention and are unavailable under zero data retention unless Anthropic authorises it. Stateful features (files, code-execution containers, batches, managed agent sessions) keep data by their own rules and sit outside ZDR. The Files API keeps uploads until deleted or expired, and files are visible to the whole workspace, so never accept file ids from end users.
- **Training**: retained API data is not used to train models without express permission; say so and link the policy rather than asserting from memory. Other providers differ, so check before you promise.
- **Region**: some providers let you pin inference to a geography (Anthropic's `inference_geo`), and cloud marketplaces (Bedrock, Vertex, Foundry) keep traffic inside a cloud account; relevant for residency requirements.
- **Your side**: data minimisation in prompts (send the fields the task needs, not the whole record), tenant isolation in retrieval and files, deletion requests propagating to logs, caches, memory stores and vector indexes, and a DPA with the provider.
- **Audit**: who accessed transcripts, when prompts changed, which model served a given answer.

## Common interview questions

**How do you handle a 429 from the model provider?**
Honour `retry-after`, back off exponentially with jitter for a bounded number of attempts, and shed or queue lower-priority traffic. Use the remaining-quota headers to slow down before the limit, and raise cache hit rate because cached reads do not count toward the token limit.

**What is the risk in retrying an LLM call?**
Generation is non-deterministic and billed, so a retry can produce a different answer and double charge, and any tool with side effects can run twice. Retry only before the first byte, key requests with a client message id, and make side-effecting tools idempotent.

**How do you keep LLM cost under control?**
Measure usage per feature and tenant from the response `usage`, set budgets with alerts, cache the stable prefix, route easy work to smaller models or lower effort, batch offline jobs, and cap tokens, turns and iterations.

**What would you log, and what would you refuse to log?**
Trace ids, feature, model, prompt version, latency per stage, token usage, stop reason, and retrieval ids. Not raw prompts and responses by default; if stored at all, redacted, encrypted, access-controlled, short-lived and opt-in.

**How do you ship a prompt change safely?**
Run the golden set in CI, shadow the candidate on real traffic, then A/B with sticky assignment and a kill switch in config. Version the prompt in every log line so you can attribute metric movement.

**Why structured outputs rather than asking for JSON?**
Schema-constrained decoding guarantees the shape, removing a class of parsing failures. You still validate with your own schema for business invariants and truncation, and you cannot use it alongside citations.

**A customer asks whether their data trains the model and where it is stored. What do you say?**
State the provider's documented policy (API data is not used for training without permission; conversation content is not retained by default except where a model or stateful feature requires it, with zero-retention arrangements for eligible features), explain where your own copies live and how deletion propagates, and offer the region or cloud-marketplace options if residency matters.
