---
title: Tool Calling Fundamentals
order: 1
summary: Tool definitions as JSON Schema, the request, tool_use, tool_result loop, parallel calls, errors as results, idempotency, strict schemas, and when a tool beats stuffing data into the prompt.
---

Tool calling (function calling) is how a model does anything beyond emitting text: it asks your code to run a function and reads the result. Every agent framework, MCP and the coding assistants are built on this one loop, so interviewers expect you to describe it precisely.

## What a tool is

A tool is a JSON Schema the model can "fill in". You send definitions; the model returns a structured call; nothing executes unless your code runs it.

```json
{
  "name": "get_order",
  "description": "Look up a single order by its id. Use when the user refers to a specific order number. Returns status, items and totals; does not return payment details.",
  "input_schema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string", "description": "Order id in the form ORD-12345" }
    },
    "required": ["order_id"],
    "additionalProperties": false
  }
}
```

Rules that hold across vendors:

- `name` is a short identifier (Anthropic: `^[a-zA-Z0-9_-]{1,128}$`; MCP recommends the same character set plus dots).
- `description` is the most important field. Say what it does, when to use it and when not to, what each parameter means, and what it does not return. Aim for a few sentences, not a few words.
- `input_schema` is JSON Schema. Describe every property; use enums for closed sets; mark required fields.
- Definitions are sent on every request and cost input tokens, plus a vendor system prompt that enables tool use (a few hundred tokens). Cache them.

## The loop

```text
1. Request:   tools + messages
2. Response:  stop_reason = "tool_use"; content has one or more tool_use blocks
              { "type": "tool_use", "id": "toolu_01…", "name": "get_order", "input": { "order_id": "ORD-12345" } }
3. Your code: run get_order(input)
4. Request:   append the assistant message unchanged, then a user message with
              { "type": "tool_result", "tool_use_id": "toolu_01…", "content": "…" }
5. Response:  either another tool_use (go to 3) or stop_reason = "end_turn" with text
```

Details interviewers probe:

- The assistant message containing the `tool_use` block goes back **verbatim** (including any thinking blocks), followed by a user message containing the results. Results are matched by `tool_use_id`, not by position.
- The model may emit text before the tool call ("Let me check that order"); treat it as ordinary assistant text, do not parse it.
- Stop reasons are the control flow: `tool_use` means run tools and continue, `end_turn` means done, `max_tokens` means you truncated, `refusal` means stop.
- Always parse `input` as JSON and validate it against the schema before executing; the model can omit fields or invent values if the prompt is ambiguous.

In TypeScript the loop is a dozen lines:

```ts
let messages: MessageParam[] = [{ role: "user", content: userText }];
for (let step = 0; step < MAX_STEPS; step++) {
  const res = await llm.create({ model, tools, messages, max_tokens: 4096 });
  messages.push({ role: "assistant", content: res.content });
  if (res.stop_reason !== "tool_use") break;

  const calls = res.content.filter((b) => b.type === "tool_use");
  const results = await Promise.all(calls.map(runTool)); // parallel
  messages.push({ role: "user", content: results });      // all in ONE message
}
```

## Parallel tool calls

One response can contain several `tool_use` blocks when the calls are independent (fetch weather for three cities). Run them concurrently and return **all** results in a single user message, in any order; splitting them across messages teaches the model to stop parallelising. If your tools cannot run concurrently, disable parallel calls (`disable_parallel_tool_use` on Anthropic) rather than serialising silently.

## Errors are results

A failed tool is information the model can act on, so return it as a result, not as an exception that kills the loop:

```json
{ "type": "tool_result", "tool_use_id": "toolu_01…", "is_error": true,
  "content": "Order ORD-12345 not found. Ids look like ORD- followed by five digits; ask the user to confirm." }
```

Write error text the way you would for a junior colleague: what went wrong and what to try next. MCP makes the same distinction: protocol errors (unknown tool, malformed request) are JSON-RPC errors, while execution errors come back as a normal result with `isError: true` so the model can self-correct.

## Idempotency and side effects

The model may call a tool twice (retry after an error, or because the result looked wrong). Make side-effecting tools safe to repeat:

- Accept an idempotency key or derive one from the arguments.
- Separate "prepare" from "commit" for anything irreversible, and gate the commit on approval.
- Return the created resource's id so the model does not create it again.
- Mark intent in metadata where the protocol supports it (MCP's `readOnlyHint`, `destructiveHint`, `idempotentHint`) so hosts can apply policy.

## Strict schemas and forced tool use

- **Strict mode** (`strict: true` on Anthropic; equivalents elsewhere) makes the emitted arguments guaranteed to validate against the schema. It requires `additionalProperties: false` and listed `required` fields, and it uses a JSON Schema subset. Use it for anything you will execute without a human looking.
- **`tool_choice`** controls whether the model must call a tool: `auto` (default), `any` (some tool), a named `tool`, or `none`. Several current frontier models reject `any` and named forcing with a 400 and expect `auto` plus prompt steering, or structured outputs when you only wanted JSON. Check the model's docs before relying on it.
- A forced call skips any pre-call thinking, so it can lower quality on hard decisions.

## Tool vs data in the prompt

| Put it in the prompt | Make it a tool |
|---|---|
| Small, static, needed every time (policy text, schema) | Large or dynamic (search results, user records) |
| The model must see all of it to answer | The model needs a slice chosen at runtime |
| No side effects, no auth | Side effects, per-user auth, audit requirements |
| Cheap and cacheable | Expensive, so fetch only when needed |

A tool costs a round trip (full request, history resent) but keeps context small and lets you enforce access control per call. Rule of thumb: if the data is under a few thousand tokens and always relevant, inline it in the cached prefix; otherwise expose a tool with pagination and filters.

## Server-side vs client-side tools

- **Client-side (user-defined)**: you define the schema and run the code. The model returns `tool_use`; you return `tool_result`. This is the default and what MCP tools become inside a host.
- **Vendor-schema client tools**: the vendor publishes the schema and trains the model on it (bash, text editor, computer use); you still execute.
- **Server-side tools**: the vendor runs them (web search, web fetch, code execution, tool search). You add one line to `tools` and get results inline in the same response, sometimes with extra per-use pricing and a `pause_turn` stop reason for long operations.
- **Tool search / deferred loading**: with hundreds of tools, mark them deferred and let the model search for the ones it needs so definitions do not flood the context.

## Design checklist for a tool surface

- Fewer, more capable tools; consolidate `create_pr`/`review_pr`/`merge_pr` into one with an `action` enum.
- Namespace by service (`github_list_prs`, `slack_send_message`).
- Return high-signal, stable identifiers and only the fields needed for the next decision; offer a `concise`/`detailed` response format.
- Paginate, filter and truncate with sensible defaults; a tool that returns 40k tokens is a context bomb.
- Keep tool ordering deterministic (prompt caching).
- Evaluate tools with realistic multi-step tasks and read the transcripts.

## Common interview questions

**Walk me through one tool call end to end.**
I send tool definitions with the messages; the model replies with `stop_reason: tool_use` and a `tool_use` block containing an id, name and JSON input. I validate the input, run the function, append the assistant message unchanged plus a user message with a `tool_result` keyed by that id, and call again; the model either calls more tools or answers.

**What happens when a tool fails?**
Return a `tool_result` with `is_error: true` and an actionable message so the model can retry with different arguments or tell the user. Throwing out of the loop loses the conversation state, and silently dropping the result confuses the model.

**How do you handle parallel tool calls?**
Run the independent calls concurrently and return every result in one user message. If the tools must be serial, disable parallel calls explicitly rather than returning results one message at a time.

**Why do tool descriptions matter so much?**
The model decides when and how to call a tool from the description alone. A vague description produces wrong tool choices and invented arguments; a few sentences covering purpose, when not to use it, parameter meaning and limits is the single highest-leverage fix.

**What does strict tool use guarantee, and what does it not?**
It guarantees the emitted arguments validate against your schema, so parsing never fails. It does not guarantee the values are correct or that the call should happen, so you still validate semantics and gate side effects.

**When would you put data in the prompt instead of behind a tool?**
When it is small, always relevant and static enough to cache; then it costs nothing extra per turn and needs no round trip. Large, dynamic or per-user data goes behind a tool with filters and access control.

**Client tool versus server tool?**
A client tool is a schema you define and code you run; a server tool runs on the vendor's side (search, code execution) and returns results inline. Server tools save you a loop iteration and infrastructure; client tools give you control and access to your own systems.
