---
title: Retrieval and Production
order: 13
module: ai-retrieval-and-production
summary: RAG pipeline choices, retrieval and answer metrics, context and memory management, streaming UX, and production concerns like rate limits, cost, caching and compliance.
---

## When would you choose long context over RAG?

When the whole corpus fits comfortably in the window and is shared by all users, so there is no index to keep in sync and prompt caching makes the repeated prefix cheap. Move to RAG when the corpus outgrows the window, changes often, or needs per-user permissions.

## Why doesn't fine-tuning replace retrieval for a company's documentation?

Fine-tuning changes behaviour and style but is unreliable for injecting facts, goes stale when documents change, and gives no citations. Retrieval supplies current, permission-filtered facts at request time.

## What happens to your vector index when you switch embedding models?

Every stored vector becomes incomparable with new query vectors because the two models use different spaces. You must re-embed the entire corpus into a new index, validate it on the golden set, and cut over atomically, so store the model version with each vector.

## Why combine BM25 with vector search?

Dense vectors capture meaning but miss exact tokens such as error codes, SKUs and names; keyword search catches those but misses paraphrase. Fusing both covers each other's gaps.

## Why use reciprocal rank fusion instead of averaging the scores from BM25 and vector search?

BM25 scores and cosine similarities are on different, uncalibrated scales. RRF combines ranks (`1 / (k + rank)`), so no score normalisation is needed and a document ranked well by either system rises.

## What does a reranker do that the embedding search does not?

A cross-encoder reads the query and each candidate together and scores relevance far more accurately than vector distance, at a cost linear in candidates. You retrieve a wide set (50–150) and rerank down to the 10–20 that go into the prompt.

## Where should access-control filtering happen in a RAG query, and why?

Inside the retrieval query, before ranking, using the caller's server-resolved identity. Filtering the top-k afterwards leaks the existence of forbidden documents and often leaves an empty result.

## What does contextual retrieval add to a chunk before it is embedded?

A short generated description (roughly 50–100 tokens) situating the chunk in its document, such as which product or period it describes. Prepended before embedding and BM25 indexing, it restores context lost by chunking; Anthropic reported a 49% drop in retrieval failures with both, 67% with reranking added.

## Why are API-level citations preferable to asking the model to quote its sources?

They bind each text span to a verified location in a supplied document, so the reference cannot be invented, and the cited text does not count as output tokens. The trade-off is that they cannot be combined with structured JSON output in the same request.

## What is recall@k and why is it the first RAG metric to look at?

The fraction of the chunks that answer a question that appear in the top k retrieved. If the evidence is not in the prompt, no generation improvement can help, so it isolates retrieval failures from model failures.

## What is faithfulness, and how does it differ from correctness?

Faithfulness checks that every claim is supported by the retrieved context; correctness checks the answer matches the truth. An answer can be faithful to a stale document and wrong, or correct from memory and unfaithful, and the fixes differ.

## What is "lost in the middle" and what do you do about it?

Models attend less reliably to evidence buried in the middle of a long context, so a correct chunk at position 12 of 20 may be ignored. Rerank so the strongest chunks come first, send fewer better chunks, and put the question after the context.

## How do you detect and fix a stale index?

Measure index lag, the time from a document change to its chunks being updated, and alert on it. Fix with event-driven reindexing, delete-then-insert per document, and golden-set questions about recently changed documents.

## What is the main caveat when using an LLM as a judge in evals?

It must be calibrated: compare its scores to a human-labelled sample so you know its agreement rate, use a rubric with named criteria, keep it blind to which system produced the answer, and keep a small human-reviewed sample running to catch drift.

## In what order is a request rendered for prompt caching, and why does it matter?

Tools, then system, then messages, and caching is a prefix match. Anything volatile placed early, such as a timestamp in the system prompt, invalidates everything after it, so stable content must come first.

## Roughly what do prompt cache writes and reads cost relative to base input?

Writes cost 1.25x for the 5-minute TTL and 2x for the 1-hour TTL; reads cost about 0.1x on most models and less on the newest. Two requests sharing a prefix already break even on the short TTL.

## Which `usage` fields tell you prompt caching is working?

`cache_read_input_tokens` should grow turn over turn, `cache_creation_input_tokens` should be about the size of the newly added turn, and `input_tokens` only the tail after the breakpoint. Creation near the whole conversation size every turn means the prefix is being rewritten.

## What is the difference between clearing tool results and compaction?

Clearing removes specific bulky blocks, usually old tool outputs, leaving the transcript shape intact. Compaction replaces a span of history with a summary, freeing far more space at the cost of fidelity. Both rewrite the prefix, so do them at thresholds, not every turn.

## What should a good compaction summary keep?

Decisions and their reasons, unresolved problems, constraints the user stated, identifiers and files recently touched, and the user's goal in their own words. It drops raw tool outputs, superseded attempts and pleasantries; tune for recall first.

## How is user memory different from conversation history?

History is the per-conversation transcript, resent every turn. User memory is a small, durable per-user store of preferences and facts, written by an extraction step or a memory tool, retrieved selectively per request, and visible and deletable by the user.

## Why is a streaming fetch body the default transport for chat rather than `EventSource` or WebSockets?

A chat turn is one POST with a long response, and fetch gives you auth headers, a JSON body and cancellation via `AbortController`. `EventSource` is GET-only without custom headers; WebSockets add connection management you only need when the client sends mid-stream.

## Why can't you render streamed markdown token by token?

Constructs like `**bold**` and code fences may not close for hundreds of tokens, so a per-token render flips between interpretations. Re-parse the accumulated buffer on a throttled schedule, close open constructs provisionally, and sanitise the output.

## How do you resume a dropped stream without regenerating?

Give every frame an id and buffer frames server-side under the message id for a short window. The client reconnects with the last id it saw and receives only the remainder; if the buffer is gone, offer an explicit regenerate.

## How should a streaming answer be announced to screen reader users?

Not token by token. Use a polite live region for state changes such as started, complete, stopped and error, keep focus where the user left it, make Stop a keyboard-reachable button, and respect reduced-motion preferences.

## Why is retrying an LLM call riskier than retrying a normal HTTP call?

Generation is non-deterministic and billed, so a retry can produce a different answer and a double charge, and tools with side effects can run twice. Retry only before the first byte, key requests with a client message id, and make side-effecting tools idempotent.

## How should you respond to a 429 from a model provider?

Wait at least the `retry-after` seconds, back off exponentially with jitter for a bounded number of attempts, and shed or queue lower-priority traffic. Raise the cache hit rate, since on Anthropic's API cached reads do not count toward the input-token limit.

## Why does falling back to a different model cost more than the request itself?

Prompt caches are model-scoped, so failover starts from a cold cache and reprocesses the full prefix at full price, with higher latency. Expect it, flag it in logs, and keep the main loop on one model when you can.

## What should you log for an LLM request, and what should you avoid logging?

Trace id, feature, model, prompt version, latency per stage, token usage, stop reason and retrieved chunk ids. Avoid raw prompts and responses by default; if kept for evals, redact PII, encrypt, restrict access, keep retention short and make it opt-in.

## Why validate structured output with your own schema even when the API constrains it?

The provider schema guarantees shape, but not business invariants such as a date being in the future, and `max_tokens` can still truncate the response. Validation with Zod or similar turns both into explicit errors.

## What is shadow testing and when would you use it before an A/B test?

Running the candidate model or prompt on real requests in parallel, discarding its output and comparing judge scores, latency, cost and refusal rate against production. It has no user impact, so it is the step between offline evals and exposing users in an A/B.
