---
title: Context Engineering and Memory
order: 3
summary: What goes into the context window and in what order, token budgets, compacting long conversations, clearing old tool results, short- versus long-term memory, and how prompt caching shapes all of it.
---

Prompt engineering is about the words in one message; context engineering is about everything the model sees on every call: instructions, tools, retrieved data, history, and memory, assembled under a budget. Interviewers ask about it because every production LLM feature eventually hits the same wall: the conversation grows, quality drops, cost climbs, and the cache stops hitting.

## Why the window is a budget, not a bucket

- Context is finite and attention degrades gradually as it fills; Anthropic's engineering guidance calls this context rot. More tokens means more to attend over, not more accuracy.
- Cost scales with input tokens on every turn, because the API is stateless and you resend the whole conversation.
- Latency to first token grows with uncached input.

So the goal is the smallest set of high-signal tokens that lets the model do the task, assembled in a stable order.

## What goes in, and in what order

The model sees the request rendered in this order: `tools`, then `system`, then `messages`. Prompt caching is a prefix match, so the order doubles as a stability order: put what never changes first and what changes every request last.

```text
[tools]            stable: deterministic order, same set every call
[system]           stable: role, rules, output format, canonical examples
[system tail]      per-session: user profile, retrieved memory (after a breakpoint)
[messages]
  earlier turns    append-only history (never rewritten)
  retrieved chunks per-turn, in the user message, after the stable part
  current question last
```

Rules that follow from the prefix model:

- Keep the system prompt frozen. No timestamps, request ids, feature flags or user names interpolated at the top; a single changed byte there invalidates everything after it.
- Keep the tool list identical and sorted; adding or removing a tool invalidates the whole cache. Prefer loading tools on demand (tool search, deferred loading) over swapping sets.
- History is append-only. Editing or deleting an earlier turn invalidates the cache from that point and, on current Anthropic models, can invalidate preserved thinking blocks too.
- Mid-conversation instructions (a mode switch, a reminder) go **after** the history, not into the top-level system prompt. On models that support it, a `{"role": "system"}` message appended to `messages` is the clean channel for this; otherwise a text block in the latest user turn.
- Dynamic facts go late: today's date, the user's locale, retrieved documents belong in the latest user message or a late system message, never at the top.

Write the system prompt at the right altitude: specific enough to fully define the behaviour, not a list of if-else rules. Start minimal, test on the strongest model you have, and add instructions only for failures you observed.

## Budgets

Decide the split up front and enforce it in code:

| Slice | Typical share | Enforcement |
|---|---|---|
| Tools + system | fixed, a few thousand tokens | Count once; it is the cached prefix |
| Memory / profile | small cap (hundreds of tokens) | Summarise, never dump raw |
| Retrieved context | the biggest variable slice | top-k after rerank, cap per document, drop below a score floor |
| Conversation history | whatever is left, with a reserve | Compact when it crosses a threshold |
| Output reserve | `max_tokens` plus thinking | Reserve it; a truncated answer is worse than a shorter prompt |

Count tokens with the provider's counting endpoint (Anthropic's `count_tokens`) rather than estimating from characters, and record per-request `usage` so budgets are measured, not guessed.

## Long conversations: three tools

### 1. Clear old tool results

Tool outputs (search results, file contents, API responses) are the bulkiest and least reusable tokens in an agent transcript. Once the model has acted on them they can be replaced by a short placeholder. This is the lightest-touch intervention: the transcript shape stays the same, only the bulk is gone. Anthropic exposes this server-side as context editing (`clear_tool_uses` strategy, also one for old thinking blocks); you can do the same client-side by rewriting your own copy of history, but remember that rewriting history invalidates the cache from that point.

### 2. Compaction (summarise and restart)

When the conversation nears the limit, summarise the history into a compact state and continue from it. Good summaries keep: decisions and why, open problems, constraints the user stated, identifiers and file paths recently touched, and the user's goal in their words. They drop: raw tool outputs, superseded attempts, pleasantries. Tune for recall first (nothing load-bearing lost), then for precision. Server-side compaction exists on Anthropic's API (beta); the one rule is to append the returned content blocks, including the compaction block, verbatim so the next request builds on it.

### 3. Structured notes outside the window

For multi-hour agent runs, persist a notes file or a task list the agent updates and re-reads; the window holds a pointer, not the history. Subagents are the same idea sideways: a worker burns its own context on a subtask and returns a condensed result (often 1–2k tokens) to the coordinator.

Pick by shape: compaction for long back-and-forth chat, notes for milestone-driven work, subagents for parallel research.

## Short-term vs long-term memory

| Kind | Lives | Contains | Written by |
|---|---|---|---|
| Session state | Your conversation store, keyed by conversation id | Full message history, tool results, compaction summaries | Every turn |
| Working memory | The context window | What the model needs now | Assembled per request |
| User memory | A per-user store (DB rows, a memory file, a vector index) | Durable preferences and facts: "prefers metric", "team uses pnpm", project names | Explicit extraction step or a memory tool the model calls |
| Organisation knowledge | Your RAG index | Documents | Ingest pipeline |

Design points interviewers probe:

- **Write path**: extract memories with a small model at the end of a session, or give the model a memory tool with read and write operations (Anthropic ships a client-side memory tool backed by storage you implement). Either way the user should be able to see and delete memories.
- **Read path**: retrieve a few relevant memories per request and inject them after the stable prefix, not the whole store.
- **Conflicts and decay**: newer facts override older ones; store a timestamp and source turn; expire or re-confirm stale preferences.
- **Scope and privacy**: memories are per user (or per tenant), never shared across tenants, and treated as PII for retention and deletion requests.

Message threads are a separate optimisation on Anthropic's API: a short-lived server-side copy of the conversation so each request sends only new messages. It is best-effort, so keep your own copy and replay it on a miss.

## How caching interacts with all of this

- Caching rewards stable prefixes and append-only history; every trick above should be judged by "does it change bytes before the breakpoint?"
- Cache writes cost 1.25x base input (5-minute TTL) or 2x (1-hour TTL); reads are a fraction of base (0.1x on most models, lower on the newest). Two requests sharing a prefix already break even on the short TTL.
- Cache reads do not count toward Anthropic's input-token rate limit, so caching raises throughput as well as cutting cost.
- The healthy signature in `usage`: `cache_read_input_tokens` grows turn over turn, `cache_creation_input_tokens` is roughly the last turn's size, `input_tokens` is only the tail. If creation is near the whole conversation every turn, something upstream of the breakpoint is changing.
- Compaction and clearing are, by definition, prefix rewrites. Do them rarely and at thresholds, not every turn, and accept one cache miss when you do.
- Model switch means a cold cache; caches are model-scoped. Route cheap subtasks to a subagent on the cheap model rather than flipping the main loop's model.

```ts
// Shape of a per-turn request builder: stable prefix, then per-session, then per-turn.
const request = {
  model,
  system: [
    { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }, // frozen
    { type: 'text', text: renderProfile(user) },                                  // per-session, small
  ],
  tools: TOOLS, // identical every call
  messages: [
    ...history,                                     // append-only
    { role: 'user', content: [
      { type: 'text', text: renderChunks(chunks) }, // per-turn retrieval
      { type: 'text', text: question },             // last
    ] },
  ],
}
```

## Common interview questions

**What is the difference between prompt engineering and context engineering?**
Prompt engineering optimises the instructions in one message. Context engineering decides everything the model sees on every call, including tools, retrieved data, history and memory, under a token budget and in an order that stays cacheable.

**Why does order matter so much?**
Prompt caching is a prefix match over tools, then system, then messages. Stable content first and volatile content last means the expensive prefix is reused on every turn; a timestamp at the top of the system prompt silently disables the cache for everything after it.

**How do you keep a long conversation under the window?**
Clear old tool results first, because they are bulky and rarely reused. When the history still nears the limit, compact it into a summary that keeps decisions, open issues and the user's goal, and continue from that. For multi-hour agent work, keep notes outside the window.

**What is the difference between clearing tool results and compaction?**
Clearing removes specific bulky blocks and leaves the transcript shape intact; compaction replaces a span of history with a summary. Clearing is lighter and lossless about structure; compaction frees far more space at the cost of fidelity.

**How would you implement user memory?**
Extract durable facts at the end of a session (or via a memory tool the model calls), store them per user with timestamps and a source, retrieve a few relevant ones per request and inject them after the cached prefix. Expose them in settings so the user can review and delete them.

**Why does editing an earlier message hurt?**
It rewrites the prefix, so every cache breakpoint after that point misses and the whole conversation is reprocessed at full price; on models with preserved thinking it can also invalidate the reasoning blocks that follow. Treat history as append-only and add instructions after it.

**How do you decide what to send to a model with a 1M-token window?**
The same way as with a small one: a large window raises the ceiling, not the quality per token, and attention still degrades with length. Send the minimum high-signal set, use the headroom for genuinely large documents, and keep compaction thresholds below the limit so you never truncate.
