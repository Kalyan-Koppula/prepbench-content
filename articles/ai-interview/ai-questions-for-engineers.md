---
title: AI Questions for Engineers
order: 1
summary: The AI questions general SDE interviews now ask — feature design, tool use, RAG, safety, cost, evals, coding agents — each with a model answer, plus how to answer "have you built with LLMs?" honestly.
---

Most engineering loops now include one or two AI questions even when the role is not an AI role. They are rarely about model internals. They test whether you can design a feature around a slow, expensive, non-deterministic component, keep it safe, and know how to tell whether it works. Below, each question with the answer you would give in three to five sentences, plus what the interviewer is listening for.

## "Have you built with LLMs?" when you are still learning

Say what is true, specifically, and then show judgement:

> "Not in production yet. I've built a RAG prototype over my own notes with hybrid search and citations, wired streaming into a React client with cancel and resume, and written an eval set to measure recall and faithfulness. What I'd want to learn on the job is how your team handles evals and cost at scale."

What lands: concrete artefacts, the vocabulary used correctly, awareness of what production adds (evals, cost, observability, permissions), and no claims you cannot defend in a follow-up. What fails: vague "I've used ChatGPT a lot" or inflating a weekend project into a platform.

## Feature design

**"Add an AI feature to a product you know. Walk me through it."**
Pick something narrow with a measurable outcome, such as "summarise this support thread" rather than "an assistant". Define the input, the output contract (structured where possible), and what the user does with it. Decide if it needs retrieval, tools, or just a prompt. State how you would evaluate it before shipping and what the fallback is when the model fails or is slow. The interviewer listens for scoping and for an eval, not for a prompt.

**"Should this be one big prompt or a workflow?"**
Start with the simplest thing: a single call with a good system prompt and structured output. Move to a workflow (fixed steps orchestrated in code) when the task has distinct stages that benefit from different prompts or models, such as classify, then extract, then draft. Move to an agent (the model decides the steps with tools) only when the path cannot be specified in advance and the cost of errors can be caught. Each step up adds latency, cost and failure surface.

**"How do you choose a model?"**
By the task's quality bar, latency budget and volume, measured on an eval set rather than by reputation. Use the strongest model to establish what "good" looks like, then try a cheaper or faster one and keep it only if the eval holds. Route by task: a small model for classification and routing, a large one for synthesis and coding. Keep model ids in config so a change is a config flip with a kill switch.

## Tool use and agents

**"Explain tool use (function calling)."**
You describe functions with a name, description and JSON schema; the model returns a structured request to call one with arguments; your code executes it and returns the result; the model continues. The model never runs anything itself, which is why your harness owns validation, permissions and side effects. Good tool descriptions and tight schemas matter more than prompt wording. Parallel calls are normal, so execute independent ones concurrently and return all results together.

**"When would you make something a dedicated tool rather than letting the agent run shell commands?"**
When the harness needs to gate, audit, render or parallelise the action. A `send_email` tool can require confirmation and be logged with typed arguments; a shell command is an opaque string. Reversibility is the test: hard-to-reverse actions get dedicated, approval-gated tools.

**"What is MCP and why does it matter?"**
Model Context Protocol is an open standard for exposing tools, resources and prompts from a server so any compatible client (an IDE, a chat app, your assistant) can use them without bespoke integration. For a product team it means writing one server for your internal APIs and reusing it across agents. Treat every MCP server as a dependency with a trust level: its tool descriptions enter the prompt, so a malicious server is an injection vector.

**"How do you stop an agent from doing something destructive?"**
Least privilege per tool (read-only credentials where possible), approval gates on irreversible actions, dry-run modes, sandboxes for code execution, iteration and budget caps on the loop, and audit logs. Treat all tool results and retrieved content as untrusted data, not instructions.

## RAG

**"What is RAG and when would you use it?"**
Retrieve relevant pieces of your own data at request time and put them in the prompt so the model answers from them, with citations. Use it when the knowledge is private, large or changing, or when permissions differ per user. If the corpus fits in the context window with room to spare, start with long context plus prompt caching; fine-tuning teaches style, not facts.

**"What usually goes wrong with RAG?"**
Retrieval, not generation: bad chunking, a stale index, queries phrased differently from the documents, and permission leaks from filtering after ranking. Fix with structure-aware chunks, event-driven reindexing, hybrid search and query rewriting, ACL filters inside the retrieval query, and a golden set measuring recall@k so you know which stage failed.

**"How do you make the answers trustworthy?"**
Ground every claim in a retrieved source and show the citation; prefer API-level citations that bind text spans to documents over asking the model to quote. Instruct it to say when the context lacks the answer, measure faithfulness with a judge, and surface a "no sources" state rather than letting it answer from memory.

## Safety

**"What is prompt injection and how do you defend against it?"**
Untrusted content (a web page, a document, a tool result, another user's message) contains instructions the model follows as if they came from you. There is no complete fix, so defend in depth: separate instructions from data in the prompt, keep operator instructions in the system channel, give tools least privilege, require approval for side effects, never let the model see secrets it could exfiltrate, filter or sanitise retrieved content, and monitor for anomalous tool calls.

**"How do you handle harmful or off-topic requests?"**
Scope the assistant in the system prompt, rely on the model's built-in refusals and check the stop reason, add your own policy classifier for domain-specific rules, and design a graceful refusal in the UI. Log refusals so you can tune without storing raw content more than necessary.

**"What about hallucinations?"**
Reduce them with grounding (retrieval plus citations), structured outputs, lower-stakes phrasing ("suggest" rather than "assert"), and a verification step for high-stakes claims. Measure them with a faithfulness metric, and design the UI so a wrong answer is cheap to catch (show sources, make edits easy).

## Cost and performance

**"How do you keep an LLM feature affordable?"**
Measure tokens per feature from the usage fields and set budgets. Then the cheap levers: prompt caching for the stable prefix, shorter prompts, structured outputs to cut retries, smaller models or lower effort on easy routes, batching offline work. Judge cost per completed task, since a cheaper model that needs more turns is not cheaper.

**"Why is prompt caching such a big deal?"**
Most of a request is the same system prompt, tools and conversation history resent every turn. Caching that prefix cuts input cost to a fraction and lowers time to first token, and on some providers cached reads do not count toward rate limits. It only works if the prefix is byte-stable, so prompt assembly order matters.

**"How do you make it feel fast?"**
Stream tokens, show the first token quickly, render tool steps as they happen, cache the prefix, and pick a model that fits the latency budget. Precompute what you can (embeddings, summaries) so the request path does less.

## Evals

**"How do you know a change made things better?"**
A versioned eval set of real inputs with reference outputs or rubrics, run in CI on every prompt, model or retrieval change. Separate metrics per stage (retrieval recall, answer faithfulness and relevance), an LLM judge calibrated against human labels, then shadow traffic and an A/B with product metrics before full rollout.

**"What makes a good eval set?"**
Real, representative inputs including the hard and unanswerable cases, labelled by more than one person, large enough for stable numbers (hundreds), stratified by category, and refreshed from production failures. It is treated as code: versioned, reviewed, and run automatically.

## Using coding agents

**"How do you use AI coding tools, and how do you keep quality up?"**
For scaffolding, tests, refactors with clear specs, and exploring unfamiliar code. I give them context (the relevant files, conventions, the failing test) and a precise task, review every diff as if it came from a junior engineer, and never merge what I cannot explain. Tests and CI are the safety net; the tool does not change the standard, it changes how fast I reach it.

**"What are the risks of coding agents on a team?"**
Plausible-looking code that is subtly wrong, licence and secret leakage, dependency sprawl, and reviewers rubber-stamping large AI-generated diffs. Mitigate with small PRs, mandatory tests, secret scanning, allowlisted dependencies, and a team norm that the author owns the code regardless of who typed it.

## What the interviewer is scoring

| Signal | Strong answer | Weak answer |
|---|---|---|
| Scoping | Narrow task, defined input and output contract | "An assistant that helps with everything" |
| Reliability thinking | Timeouts, retries, fallbacks, structured outputs, budgets | Assumes the model always answers |
| Evidence | Names an eval and a metric before claiming a model is "good enough" | Picks a model by reputation |
| Safety | Injection, least-privilege tools, approvals, data minimisation | "The model will refuse bad things" |
| Cost awareness | Tokens per feature, caching, routing, batch | No idea what a request costs |
| Honesty | Clear about what is prototype experience versus production | Inflated claims that collapse under a follow-up |

## Questions worth asking them

- How do you evaluate changes to prompts and models before shipping?
- Who owns cost and quality for AI features, and what do they measure?
- Which provider or models do you use, and how portable is the integration?
- How do you handle customer data in prompts and logs?

Asking these signals that you have thought about production, and the answers tell you how mature the team is.

## Worked answer: "How would you add an AI summary to our product?"

A strong answer covers the full lifecycle in about three minutes:

1. **Clarify the value and the risk.** "Who reads the summary, and what happens if it's wrong? A summary of a support thread for an agent is low risk; a summary of a contract for a customer is high risk and needs citations and review."
2. **Start without AI cleverness.** "First version: one model call with a clear prompt and a structured output (summary, key points, open questions). No agent, no RAG unless the thread needs external context."
3. **Define quality before building.** "Collect 100 real threads, write a rubric (faithful, complete, concise), label a set, and measure the model against it. That also tells us whether a smaller, cheaper model is good enough."
4. **Engineer for production.** "Stream the output, cache by thread version, set timeouts and a fallback, track cost per summary, and redact personal data in logs."
5. **Handle safety.** "Thread content is untrusted, so it's delimited as data; the summariser has no tools, so injection can at worst produce a bad summary, which users can flag."
6. **Measure in production.** "Thumbs up/down with reasons, edit rate if agents correct summaries, and a weekly sample reviewed against the rubric."

The interviewer is scoring judgement: matching the solution to the risk, measuring quality, and treating the model as one unreliable component inside an engineered system.

## Common interview questions

**What is the difference between a workflow and an agent?**
A workflow is steps you fix in code with model calls inside them; an agent lets the model choose the next step and tools in a loop. Workflows are more predictable and cheaper; agents handle open-ended tasks and need caps, approvals and evals.

**Why not fine-tune to teach the model our documentation?**
Fine-tuning shapes behaviour and style but is poor at injecting facts, goes stale as the docs change, and gives no citations. Retrieval provides fresh, permissioned, citable facts at request time.

**What goes in the system prompt versus the user message?**
Stable role, rules, format and examples go in the system prompt, which is also the cached prefix. Per-request data such as the question, retrieved documents and dynamic facts goes in the user turn, and content from untrusted sources is clearly marked as data.

**How would you add a feature flag for an AI model change?**
Put model id, prompt version and retrieval parameters in config with per-feature overrides, tag every request log with them, and roll out by percentage with sticky assignment and an instant rollback.

**What is a token and why do engineers care?**
The unit models read and bill by, roughly three quarters of an English word. Context limits, latency, rate limits and cost are all in tokens, so budgets are set and measured in them.

**How do you handle a user asking the assistant to ignore its instructions?**
Keep operator instructions in the system channel the user cannot edit, scope what the assistant can do rather than relying on refusals, and make sure nothing dangerous is reachable even if the instructions were bypassed, because sufficiently creative injection will eventually get through.

## Key takeaways

- Frame AI features by user value and the cost of errors first.
- Start with the simplest design: one well-specified call with structured output.
- Define quality with evals before optimising prompts or models.
- Cover production concerns: streaming, caching, timeouts, cost, privacy.
- Show honest, concrete experience, including what didn't work.
