---
title: LLM Foundations
order: 11
module: ai-foundations
summary: Tokens and context, sampling and non-determinism, cost and latency levers, prompting in code, caching, structured outputs, evals, LLM judges, injection and guardrails.
---

## Why can two identical LLM requests at temperature 0 return different text?

Temperature 0 is near-greedy sampling, not exact, and batched GPU inference introduces floating-point non-determinism. Treat outputs as probabilistic: validate them, make downstream steps idempotent, and grade with evals rather than golden strings.

## Why are output tokens the first thing to cut when an LLM feature is slow or expensive?

Output tokens cost several times more per token than input and are generated sequentially, so they dominate both latency and bill. Asking for terse answers or a tight schema is the cheapest win before touching model choice.

## What does prompt caching actually cache, and what invalidates it?

The longest previously seen prefix of the rendered request, in the order tools, then system, then messages, up to a breakpoint you mark. Any byte change earlier in the prefix, including a timestamp, a reordered tool list or a changed `tool_choice`, invalidates everything after it.

## How do you confirm prompt caching is working?

Check the usage fields on the response: a non-zero `cache_read_input_tokens` on repeated requests. If it stays at zero, something in the prefix is changing or the prefix is shorter than the minimum cacheable length.

## Why should end-user text never be concatenated into the system prompt?

It promotes untrusted content to operator authority, making injection trivial, and it changes the prefix every request so caching never hits. User text belongs in a delimited user turn.

## What does schema-constrained output guarantee, and what does it not?

It guarantees the response parses and matches the JSON Schema shape. It does not guarantee the values are correct or exist, so you still validate semantics in code and handle unsupported schema keywords by validating them yourself.

## What is "context rot" and what does it imply for design?

Accuracy and recall degrade as the context window fills, even well below the limit. The design goal is the smallest working set that lets the model act, using retrieval, compaction and tool-result clearing rather than relying on a large window.

## What changes when you enable a reasoning or thinking mode?

Multi-step quality improves while cost and latency rise because thinking is billed as output tokens, usually controlled by an effort level rather than a toggle. The deliberation is mostly hidden, so you should not build on reading it, and thinking blocks must be passed back unchanged in multi-turn flows.

## How would you choose a model tier for a new feature?

Write a small eval from real inputs, run the strongest model to set the ceiling, then step down tiers or effort until quality drops, and route different steps to different tiers. Compare cost per completed task, not per request, because retries and extra turns erase cheap-call savings.

## What is the difference between hallucination and an instruction-following failure, and how do you mitigate each?

Hallucination is confident fabrication; mitigate with grounding, citations, tools for facts and validation. Instruction-following failure is ignoring a rule you gave; mitigate with short consistent system prompts and enforcing the rule in code rather than in prose.

## Why write the eval before tuning the prompt?

Without a fixed set and a grader, every edit is judged on the one example in front of you, and regressions elsewhere go unnoticed. The eval also encodes the agreed definition of "good" and makes model upgrades safe to automate.

## Where do eval cases come from?

Anonymised real traffic sampled to mirror the input distribution, then over-sampled for edges: ambiguous, over-long, out-of-scope and adversarial inputs. Every production failure becomes a new case.

## Name three biases of an LLM-as-judge and the fix for each.

Position bias in pairwise comparisons (swap the order and discard inconsistent verdicts), length bias (anchor rubrics on specific criteria, not impressions), and self-preference (use a different model family as judge). Calibrate against human labels before trusting the scores.

## Why ask a judge model to reason before giving a verdict?

A short justification per criterion improves consistency and makes failures reviewable. Follow it with a constrained verdict (pass/fail or an anchored scale) so the score is machine-readable and less noisy than a free-form rating.

## How do you make an eval gate in CI meaningful given non-deterministic outputs?

Run each case several times and compare pass rates or pass@k against the baseline per slice, with a tolerance band, and keep a held-out slice you never tune against. Single-run exact-match gates are flaky and get ignored.

## What should an eval run report besides quality?

Per case and aggregate: input, cached and output tokens, cost, time-to-first-token, total latency, tool calls and retries. Decisions are made on quality against cost per task and p95 latency, not quality alone.

## What is indirect prompt injection?

Instruction-like text hidden in content the model reads, such as a web page, email or tool result, that steers the agent without the user typing anything. It is the dangerous case because the user never sees the attack and the agent may have tools that act on it.

## Can delimiting untrusted content with tags solve prompt injection?

No. Tags and "treat this as data" instructions reduce it and make the policy explicit, but the model cannot reliably separate instructions from content. The real controls are least privilege, approval on side effects, output validation and budgets.

## What is the confused deputy problem in an LLM system?

A component acting with its own broad authority is tricked into using it for a caller who should not have it, for example an agent with a service account reading another customer's data. Fix by authorising per call with the caller's identity, scoping tokens, and never forwarding tokens issued for another audience.

## How can an agent leak data through a tool, and how do you prevent it?

Any tool that sends text somewhere (fetch a URL, send an email, render a markdown image) can carry context contents to an attacker. Allow-list destinations, keep secrets out of the context by resolving credentials server-side, redact tool results, and sanitise rendered links and images.

## Which tool calls should require human approval?

Irreversible or externally visible ones: sending messages, payments, deletes, deployments and permission changes. Bounded read-only calls can auto-run with output limits; reversible writes can run with an audit log.

## What limits do you put around an agent loop?

Hard caps on steps, tokens and wall-clock per task, timeouts on every tool call, circuit breakers on repeated identical calls and error bursts, per-tenant rate limits, and spend alerts per feature. Advisory budgets the model can see are helpful but the enforced stop lives in your code.

## How do you handle PII in prompts and transcripts?

Send only the fields the task needs, pseudonymise where possible and re-identify in code, choose the vendor's retention terms deliberately, keep transcripts out of general logs, and run an output check for leaked identifiers before the response reaches the user.

## Why validate model output like form input from the internet?

Because the model can be wrong or steered, and its output may be rendered, executed or stored. Parse against a schema, check semantics (ids exist, amounts within policy), sanitise before rendering, and only execute generated code in a sandbox with minimal privileges.
