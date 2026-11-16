---
title: LLMs for Engineers
order: 1
summary: Tokens, context windows, sampling, cost and latency drivers, model tiers, reasoning modes, and the model limits that should shape your design.
---

Interviewers rarely ask you to explain transformers. They ask whether you can reason about an LLM the way you reason about a database: what it costs, where it is slow, what it gets wrong, and how you design around that. This sheet is the mental model you need to answer those questions crisply.

## Tokens and tokenisers

- A model reads and writes **tokens**, not characters. A tokeniser (usually byte-pair encoding) splits text into subword pieces. English prose runs roughly 3–4 characters per token, so 1,000 tokens is about 750 words; code, JSON and non-Latin scripts tokenise less efficiently.
- Every vendor and model family has its own tokeniser, so token counts (and therefore price) differ for identical text. Use the vendor's count-tokens endpoint rather than a third-party library when you need exact numbers.
- Consequences that matter in design: whitespace and indentation cost tokens, pretty-printed JSON is more expensive than compact JSON, and "characters remaining" in a UI is not "tokens remaining".

## Context window

The context window is everything the model can see for one request: system prompt, tool definitions, the whole message history, retrieved documents, tool results, and the response it is about to generate (including any thinking). Current frontier models offer around 1M tokens of context with output caps in the 100k range; smaller or older models sit at 128k–200k. Check the vendor's model table rather than assuming.

Two things interviewers want you to say:

- The API is **stateless**. Every turn resends the whole conversation. Cost per turn grows with history length unless you cache or compact.
- More context is not free quality. Accuracy and recall degrade as the window fills (often called **context rot**), so curating what goes in matters more than how much room there is.

If input alone exceeds the window you get a validation error; if generation hits the limit the response stops with a dedicated stop reason. Design for both: count tokens before sending and handle truncation.

## Sampling and why outputs vary

Generation is iterative: the model produces a probability distribution over the next token and one is sampled. `temperature` scales the distribution (0 makes it near-greedy, higher flattens it); `top_p` and `top_k` truncate it. Even at temperature 0 outputs can differ run to run because of floating-point non-determinism on batched GPU inference, so never build on "same prompt, byte-identical output".

Some newer models no longer accept sampling parameters at all and expose an **effort** setting instead. Check the API version you target before you promise a knob you cannot set.

Practical rules:

| Task | Setting |
|---|---|
| Extraction, classification, code edits | Low temperature or the vendor default; constrain with a schema |
| Brainstorming, copywriting variants | Higher temperature |
| Anything that must be reproducible | Structured output + validation + retries, not temperature tricks |

## Latency and cost drivers

Price is quoted per million tokens, separately for **input** and **output**, and output is typically 4–5x more expensive per token. Latency splits into time-to-first-token (dominated by prompt size, mitigated by caching) and tokens-per-second for the rest (dominated by output length).

| Lever | Effect |
|---|---|
| Shorter output (ask for terse answers, structured output) | Biggest latency and cost win; output tokens are the slow and expensive part |
| Prompt caching on a stable prefix | Cached input tokens cost roughly a tenth of fresh input; cuts time-to-first-token on long prompts |
| Smaller model tier for simple steps | 5–20x cheaper; route by task difficulty |
| Batch API for offline work | Typically half price in exchange for hours of turnaround |
| Streaming | Does not reduce total latency; it reduces perceived latency and avoids request timeouts on long outputs |
| Fewer tool round trips | Each agent step is a full request that resends history; consolidate tools and cache |

Say the number out loud in interviews: a 50k-token system prompt without caching is paid in full on every turn. With caching, it is paid once and then read at a fraction of the price for as long as the cache lives.

## Model tiers and how to choose

Vendors ship a small/fast tier, a mid tier, and a frontier tier (Anthropic's Haiku, Sonnet, Opus is the usual example; other vendors have equivalents). A defensible selection process:

1. Write the eval first (see the evals article).
2. Start with the strongest model to establish the ceiling.
3. Step down a tier, or lower the effort/reasoning setting, until the eval drops. Modern frontier models at low effort often beat older models at high effort, and keeping one model keeps one prompt cache.
4. Route: cheap model for classification and routing, strong model for the hard step, cheap model again for formatting.

Judge by cost per completed task, not per request. A cheaper model that needs retries or more agent turns is not cheaper.

## Reasoning and thinking modes

"Reasoning" or "thinking" modes let the model spend output tokens on hidden deliberation before answering. What changes:

- Quality on multi-step problems (maths, planning, debugging, agentic tool use) rises; chat and simple extraction rarely benefit.
- Latency and cost rise because thinking tokens are billed as output. Most vendors now expose a budget or an effort level instead of a fixed on/off switch; some models cannot have thinking disabled at all.
- Whether earlier turns' thinking stays in the context varies by model; the vendor may strip it or keep it. Pass the blocks back unchanged and let the API decide.
- The raw chain of thought is usually not returned (you get a summary or nothing). Do not build features that depend on reading it.

## Limits that should shape your design

- **Hallucination.** The model produces plausible text, not verified facts. Mitigate with retrieval and citations, structured outputs validated in code, tool calls for anything factual (dates, prices, IDs), and a human in the loop for consequential output.
- **Recency.** Knowledge has a training cutoff. Anything after it, or anything private, must come in through context: retrieval, tools, web search.
- **Instruction following.** Long, contradictory or buried instructions get ignored. Put rules in the system prompt, keep them short and consistent, and verify compliance in code rather than hoping.
- **Non-determinism.** Covered above; design idempotent, retry-safe steps and validate every output you act on.
- **Prompt injection.** Any text the model reads can try to steer it. Covered in the guardrails article; mention it unprompted when asked about limits.
- **Rate limits and quotas.** Tokens-per-minute and requests-per-minute limits exist per tier; plan backoff, queues and budgets.

## Vocabulary you should use correctly

| Term | Meaning |
|---|---|
| System prompt | Operator instructions with higher authority than user turns |
| Few-shot | Examples in the prompt showing the desired input and output |
| Structured output | Model output constrained to a JSON Schema, validated server-side |
| Tool / function calling | Model emits a structured call; your code runs it and returns the result |
| RAG | Retrieve relevant documents, then generate with them in context |
| Grounding | Tying answers to supplied sources rather than parametric memory |
| Eval | A scored test set run against a prompt or system |
| Agent | A loop where the model picks the next action from tool results until a stop condition |

## Pitfalls

- Estimating tokens from character counts and then being surprised by code, JSON or non-English text.
- Resending a growing history every turn with no caching and no compaction, so cost climbs quadratically with conversation length.
- Setting `max_tokens` low to save money and truncating answers mid-sentence; use terse prompting and structured output instead.
- Choosing a model by benchmark headlines rather than by your own eval.
- Enabling the highest reasoning effort everywhere, including the classification step that did not need it.
- Treating the model's confident tone as a signal of correctness.

## Common interview questions

**Why do two identical requests give different answers at temperature 0?**
Sampling at temperature 0 is near-greedy but not exact, and batched GPU inference introduces floating-point non-determinism. Treat outputs as probabilistic: validate them, make downstream steps idempotent, and use evals rather than golden strings.

**What actually drives the cost of an LLM feature?**
Output tokens first (they cost several times more per token and dominate latency), then uncached input tokens resent every turn, then the number of round trips in agentic flows. Caching a stable prefix, keeping outputs short, and consolidating tool calls are the three cheapest fixes.

**How would you pick a model for a new feature?**
Write a small eval from real inputs, measure the strongest model to set the ceiling, then step down tiers or effort levels until quality falls. Route different steps to different tiers and compare cost per completed task, not per call.

**What does a "thinking" mode change for my system?**
It improves multi-step reasoning at the price of more output tokens and latency, and it is now usually controlled by an effort level rather than a toggle. The deliberation is mostly hidden, so you cannot rely on reading it, and you should pass thinking blocks back unchanged in multi-turn flows.

**Why is a bigger context window not a complete answer to long documents?**
Everything in the window costs tokens on every turn, and recall degrades as it fills. Retrieval, summarisation and compaction keep the working set small; the window is a ceiling, not a strategy.

**How do you handle facts the model cannot know?**
Anything after the training cutoff or private to the business must be supplied through context: retrieval over your data, tools that query live systems, or web search. Ask the model to cite the supplied source so you can verify it.

**What is the difference between hallucination and an instruction-following failure?**
Hallucination is confident fabrication of content; instruction-following failure is ignoring or misapplying a rule you gave it. The first is mitigated with grounding and validation, the second with shorter, consistent prompts and code-level enforcement of the rule.
