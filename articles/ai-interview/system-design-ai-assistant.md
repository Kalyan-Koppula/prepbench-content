---
title: "System Design: In-Product AI Assistant"
order: 2
summary: RADIO-style design of an AI assistant inside a SaaS product — requirements, gateway, retrieval, tool layer via MCP, model layer, evals, data model, streaming API, caching and routing, safety, and deep-dive questions.
---

The modern "design a chat system" prompt: an assistant inside a SaaS product (say, a project-management tool) that answers questions about the user's data, drafts content, and performs actions on their behalf. Forty-five minutes covers requirements, architecture, data model, API, optimisations and safety; the interviewer drills into whichever you sound confident about.

## Requirements

### Clarifying questions

- What can it answer: product help, the user's own data, both? What actions may it take (create a task, send a message)?
- Multi-tenant? Per-user permissions on the underlying data?
- Latency expectations: first token under a second? Full answer in a few seconds?
- Scale: monthly active users, conversations per day, average turns?
- Which models and providers may we use; any data-residency or no-training requirements?
- Must answers cite sources? Must actions be confirmed by the user?

### Functional

- Multi-turn chat with streaming responses, history per user.
- Retrieval over product docs and the tenant's own data, with citations.
- Tool calls for read and write actions, with confirmation for writes.
- Feedback (thumbs), regenerate, stop.

### Non-functional

- Time to first token under about one second; full answer within a few seconds for typical questions.
- Tenant isolation at retrieval and tool layers; least-privilege tools.
- Cost per conversation bounded and attributable to a tenant and feature.
- Evaluable: every change measured offline before rollout; observable in production.
- Graceful degradation when the model provider is slow, rate-limited or down.

## Architecture

```text
 Browser (React)
   | POST /conversations/:id/messages  (SSE stream)
   v
+--------------------- AI gateway (your service) ----------------------+
| auth, tenant resolution, rate limiting, budgets, idempotency,          |
| prompt assembly, streaming translation, tracing, PII redaction        |
+------+------------------+-------------------+------------------------+
       |                  |                   |
       v                  v                   v
  Retrieval svc      Tool layer (MCP)     Model layer
  query rewrite      servers per domain   provider SDK, routing,
  hybrid search      (tasks, docs, CRM)   fallbacks, caching,
  ACL filter         approval policy      structured outputs
  rerank             audit log
       |                  |                   |
       v                  v                   v
  vector + text      product APIs         Claude / other models
  index (pgvector    (with user's scoped
  or vector DB)      credentials)
                                              
  Offline: ingest pipeline (change events -> chunk -> embed -> index)
           eval runner (golden set, judge), analytics, cost reports
```

- **Gateway**: the only component that talks to models. Owns prompt assembly so the cache prefix is stable, converts provider stream events to your event schema, enforces budgets and logs usage. Stateless; conversation state is in the store.
- **Retrieval service**: rewrites the query from recent turns, runs BM25 and vector search with tenant and ACL filters inside the query, fuses with reciprocal rank fusion, reranks to the top 10–20, returns chunks with ids and source metadata.
- **Tool layer via MCP**: each domain (tasks, documents, billing) exposes an MCP server with typed tools. The gateway connects as the client with the user's scoped credentials, applies an approval policy (read tools auto-run, write tools pause for confirmation), and logs every call.
- **Model layer**: provider SDK, model routing per request type, fallback chain, prompt caching, structured outputs for routing and extraction, timeouts and retries.
- **Eval and observability**: traces with latency per stage and token usage; sampled transcripts for review; offline golden-set runs in CI; shadow and A/B infrastructure.
- **Ingest pipeline**: change events from the product database and docs trigger chunking and embedding; index lag is a metric.

## Data model

```ts
type Conversation = {
  id: string
  tenantId: string
  userId: string
  title: string
  createdAt: string
  summary?: string // compaction summary of older turns
  summaryUpToSeq?: number
}

type Message = {
  id: string
  conversationId: string
  seq: number // ordering and resume cursor
  role: 'user' | 'assistant' | 'tool'
  content: ContentBlock[] // text | tool_call | tool_result | citation
  model?: string
  promptVersion?: string
  usage?: { input: number; output: number; cacheRead: number; cacheWrite: number }
  status: 'complete' | 'streaming' | 'stopped' | 'error'
  clientMessageId?: string // idempotency
  feedback?: 'up' | 'down'
  createdAt: string
}

type Chunk = {
  id: string
  tenantId: string
  sourceId: string
  sourceType: 'doc' | 'task' | 'comment'
  allowedPrincipals: string[] // groups or user ids
  headingPath: string
  body: string
  embedding: number[] // vector(1024)
  embeddingModel: string
  updatedAt: string
}

type ToolCallAudit = {
  id: string
  messageId: string
  tool: string
  args: Record<string, unknown>
  approvedBy?: string
  result: 'ok' | 'denied' | 'error'
  durationMs: number
}
```

Store messages append-only; `seq` gives ordering, resume and the compaction boundary. Keep raw provider payloads out of the primary store; keep a redacted trace in observability with a short retention.

## Interface

### Streaming endpoint

```text
POST /api/conversations/:id/messages
Idempotency-Key: <clientMessageId>
Accept: text/event-stream
{ "text": "Which tasks are overdue in Project Atlas?", "clientMessageId": "c_123" }

200 text/event-stream
id: 1   event: message_start   data: {"messageId":"m_9"}
id: 2   event: tool_call       data: {"id":"t1","name":"tasks.search","status":"running"}
id: 3   event: tool_result     data: {"id":"t1","status":"done","summary":"4 tasks"}
id: 4   event: delta           data: {"text":"Four tasks are overdue: ..."}
id: 5   event: citation        data: {"index":1,"sourceId":"task_88","title":"Ship v2"}
id: 6   event: approval_needed data: {"id":"t2","name":"tasks.assign","args":{...}}
id: 7   event: done            data: {"usage":{"input":2100,"output":180}}
```

- Resume: `GET /api/conversations/:id/messages/:messageId/stream?after=<id>` replays buffered frames for a short window.
- Approval: `POST /api/tool-calls/:id/decision { "approve": true }` resumes the paused turn.
- Stop: client aborts the request; the gateway cancels the model call and marks the message `stopped`.

### Conversation storage endpoints

```text
GET    /api/conversations?cursor=            list, newest first
GET    /api/conversations/:id/messages        paginated by seq
DELETE /api/conversations/:id                 hard delete, propagates to traces and memory
POST   /api/messages/:id/feedback             { "value": "down", "reason": "wrong" }
```

## Optimisations

### Caching

- Prompt cache: system prompt and tool definitions are byte-stable and first; per-tenant context and retrieved chunks come after the breakpoint; history is append-only. Verify with the usage fields in production, not once at launch.
- Retrieval cache keyed on rewritten query plus tenant, short TTL, invalidated by index updates.
- Exact response cache for deterministic sub-calls (routing, classification) keyed on prompt version plus input.

### Routing between models

- A cheap, fast model classifies the turn: chit-chat, product question, data question, action. Chit-chat and simple product questions go to a small model; data questions with tools and synthesis go to the strong model.
- Route on measured eval results per category, not intuition; keep the main conversation on one model to preserve the cache, and spawn cheaper side calls (query rewriting, summarisation) separately.
- Fallback chain on 429, 5xx, overloaded and timeouts, with the knowledge that failover means a cold cache.

### Budgets

- Per request: token cap for retrieved context, `max_tokens` for output, iteration cap for tool loops (for example eight), wall-clock cap.
- Per conversation: compaction threshold on input tokens; beyond a turn count, suggest a new conversation.
- Per tenant and feature: daily and monthly token budgets with alerts and a soft degrade (smaller model) before a hard stop.

### Latency

- Stream from the first token; show tool steps as they run.
- Parallelise independent tool calls; run retrieval and the routing classifier concurrently.
- Precompute embeddings and summaries offline; keep the hot index in memory.

## Safety

### Prompt injection

- Retrieved chunks and tool results are data: wrap them in clearly delimited blocks, tell the model they are untrusted, and never place operator instructions in user-editable content.
- Tools have least privilege and run with the user's own credentials, so the assistant cannot read what the user cannot.
- Secrets never enter the context; tools that need them hold them server-side.
- Write actions require approval with the arguments shown to the user; a URL in a retrieved doc cannot trigger a write.
- Monitor for anomalies: tool calls to unexpected targets, prompts containing instruction-like text from documents, spikes in refusals.

### Approvals and audit

- Policy per tool: auto-run (read), confirm (write), deny (destructive without an explicit product flow).
- Every tool call is logged with who approved it and the arguments; approvals are idempotent by tool-call id.

### Content and privacy

- Scope the assistant in the system prompt; check the provider's stop reason for refusals and render a plain explanation.
- Redact PII before anything is logged; default to not storing raw prompts; honour deletion by removing messages, traces, memories and derived indexes.
- Multi-tenant isolation everywhere: retrieval filters, tool credentials, file uploads, caches keyed by tenant.

## Deep-dive questions

**How does a request flow end to end?**
Gateway authenticates and resolves tenant, checks budgets and idempotency, loads recent history plus summary, rewrites the query, runs retrieval with ACL filters, assembles the prompt with a stable prefix, streams from the model, executes tool calls through MCP with the approval policy, translates events to the client, persists the message with usage, and emits traces.

**Where exactly are permissions enforced?**
In the retrieval query (filter by tenant and allowed principals before ranking) and in the tool layer (tools run with the user's scoped credentials). The model never sees data the user could not open directly, so a prompt injection cannot escalate access.

**How do you keep the prompt cache hitting across turns?**
Tools and system prompt are identical bytes on every call; per-tenant and per-turn content goes after the breakpoint; history is append-only; compaction happens at thresholds, accepting one miss. Monitor cache read tokens per request and alert when they collapse.

**What happens when the model provider is down?**
Timeouts fire quickly, the fallback chain tries a secondary model or provider, and if everything fails the UI shows a clear error with retry while preserving the user's message. Read-only parts of the product keep working because the assistant is an addition, not a dependency.

**How would you evaluate it before launch and after?**
A golden set of tenant-safe questions with labelled chunks and rubrics, run in CI for recall and faithfulness; shadow traffic for the candidate configuration; an A/B measuring task completion, thumbs, regenerate rate and cost; weekly human review of sampled transcripts, feeding failures back into the set.

**How do you handle a very long conversation?**
Clear old tool results first, compact history into a summary stored on the conversation when input tokens cross a threshold, keep durable user facts in a memory store rather than in the transcript, and suggest a fresh conversation past a turn limit.

**Why MCP for the tool layer rather than direct function definitions?**
Each domain team owns one server that any client can use, tools come with schemas and descriptions in a standard shape, and the gateway applies one approval and audit policy across all of them. The cost is treating each server as a trust boundary, because its descriptions enter the prompt.

**How do you bound cost for a tenant that uses it heavily?**
Per-tenant token budgets with soft degrade to a smaller model, caps on context size and tool iterations per turn, prompt caching so repeated prefixes are cheap, and visibility for the customer of their own usage.

**What would you build first?**
Gateway with streaming and tracing, one retrieval source with citations, one read-only tool, and the eval harness. Write tools with approvals come after the read path is trusted, because an assistant that reads well is already valuable and far easier to make safe.
