---
title: Evals and LLM-as-Judge
order: 3
summary: Why evals come before prompts, building a small set from real traffic, exact-match, rubric and LLM-judge grading with their failure modes, CI regression gates, and tracking cost and latency with quality.
---

"How do you know your change made it better?" is the question that separates people who have shipped LLM features from people who have played with them. The answer is an eval: a fixed set of inputs, a grader, and a number you can compare across prompt, model and retrieval changes.

## Why evals before prompts

- Prompt editing without an eval is vibes. You fix one example and silently break three others.
- Model upgrades, vendor deprecations and retrieval changes all need a regression check; the eval is the only thing that makes those changes safe to automate.
- The eval encodes the product definition of "good". Writing it forces the team to agree on success criteria that are specific, measurable and relevant to the use case.

Start the eval on day one, with ten cases. A small set run on every change beats a large set run once.

## Building a set from real traffic

1. Define success criteria per dimension: task fidelity, format compliance, tone, safety, latency, cost. Most features need several.
2. Sample real inputs (logged requests, support tickets, search queries), anonymised. Mirror the real distribution and then over-sample the edges: ambiguous requests, overly long input, out-of-scope questions, adversarial or injected text, cases where humans disagree.
3. Write expected outputs or rubrics. For classification and extraction, the label is the expected output. For open-ended generation, write a rubric with 3–6 concrete criteria instead of a golden answer.
4. Keep it in version control as JSONL with an id, input, expected value or rubric, and tags for slicing.
5. Grow it from failures: every production bug becomes a case.

```json
{ "id": "t-0042", "tags": ["refund", "edge"], "input": "I want my money back for the thing I didn't order", "expected": { "intent": "refund", "order_id": null } }
```

Volume with automated grading beats a few hand-graded gems. Fifty noisy automated cases catch more regressions than five perfect ones.

## Grading methods

| Method | Use when | Failure modes |
|---|---|---|
| Exact or normalised match | Labels, enums, ids, short answers | Penalises harmless variation; normalise case, whitespace, number formats |
| Code assertions | JSON validity, schema conformance, required fields present, no PII patterns, length bounds | Only checks what you thought to assert |
| Similarity metrics (embedding cosine, ROUGE) | Paraphrase consistency, summarisation closeness | Rewards topical overlap, not correctness; thresholds are arbitrary |
| Execution-based | Code generation, SQL, tool-use traces (run it, check result) | Needs a sandbox; flaky environments add noise |
| Human rubric | Final sign-off, calibrating automated graders | Slow, expensive, inconsistent between raters without a rubric |
| LLM-as-judge | Tone, helpfulness, rubric adherence, pairwise preference at scale | See next section |

Mix them: schema and assertion checks first (cheap, deterministic), then a judge only on cases that pass the mechanical gates.

## LLM-as-judge

A second model grades the first model's output against a rubric. It scales where humans cannot, but it has known biases:

- **Position bias**: in pairwise comparisons the judge favours whichever answer comes first. Run both orders and discard inconsistent verdicts.
- **Length and verbosity bias**: longer, more confident answers score higher regardless of correctness.
- **Self-preference**: a model rates its own family's style higher. Use a different model as judge where possible.
- **Rubric drift**: vague rubrics ("is this helpful?") produce noisy scores. Write specific, observable criteria ("mentions the 14-day window", "does not invent an order number").
- **Over-trust**: the judge can be prompt-injected by the answer it is grading, or simply be wrong.

Making it reliable:

1. Give the judge the input, the output, the rubric, and the reference answer when one exists.
2. Ask for a short justification before the verdict, then a constrained verdict (pass/fail, or a 1–5 scale with anchors for each point).
3. Calibrate against 50–100 human-labelled cases and report judge agreement; if agreement is low, fix the rubric before trusting the numbers.
4. Prefer binary or pairwise judgements over fine-grained scales; they are more consistent.
5. Pin the judge model and prompt version. A judge upgrade is itself a change that needs re-calibration.

```text
You are grading a support reply. Criteria:
1. States the refund window is 14 days.
2. Does not promise a refund before verifying the order.
3. Tone is polite and does not blame the customer.
Give one line of reasoning per criterion, then output JSON: {"pass": boolean, "failed": [criterion numbers]}.
```

## Regression gates in CI

- Run the eval on every prompt, schema, model or retrieval change. Keep it under a few minutes by sampling or by splitting into a fast smoke set and a nightly full set.
- Report per-slice scores (by tag), not just an average. A gain on easy cases can hide a loss on the edge cases you care about.
- Gate on a threshold and on no-regression against the baseline; LLM outputs are noisy, so run each case 3–5 times and compare pass rates (pass@k or mean) rather than a single run.
- Hold out a test slice you never tune against. If you iterate on the same cases you grade, you overfit the prompt to the eval.
- Store the full transcript for failures so a reviewer can read what happened, not just the score.

## Measuring cost and latency alongside quality

Every eval run should emit, per case and in aggregate: input tokens, cached tokens, output tokens, cost, time-to-first-token, total latency, number of tool calls and retries. Then the decision table is honest:

| Change | Quality | Cost per task | p95 latency | Decision |
|---|---|---|---|---|
| Switch to smaller tier | -1 pt | -70% | -40% | Ship for the routing step only |
| Add few-shot examples | +4 pt | +15% (uncached) | +5% | Ship, move examples into cached prefix |
| Enable thinking at high effort | +6 pt on hard slice | +60% | +120% | Use only on the hard route |

Cost per completed task is the metric; a cheaper call that needs more retries or agent steps loses.

## Online evaluation

Offline evals do not catch everything. In production, log prompt version, model, usage and latency on every request; sample a slice for periodic judge scoring; capture explicit feedback (thumbs) and implicit signals (did the user retry, escalate, abandon); and route new failures back into the offline set.

## Pitfalls

- Grading with the same prompt and model that produced the output, so the judge shares its blind spots.
- Averaging across slices and missing a collapse on the edge cases that motivated the feature.
- Tuning against the whole set until the prompt is overfitted to it; keep a held-out slice.
- Golden strings for open-ended tasks, which fail on every harmless rewording.
- Silently upgrading the judge model and comparing scores across the boundary.
- Measuring quality without tokens and latency, then discovering the winning prompt doubled the bill.

## Common interview questions

**How do you know a prompt change is an improvement?**
I run a versioned eval set built from real traffic, grade it with deterministic checks first and an LLM judge for subjective criteria, and compare per-slice pass rates against the baseline across several runs. The change ships only if quality holds on the held-out slice and cost and latency are acceptable.

**What goes wrong with LLM-as-judge?**
Position bias in pairwise comparisons, preference for longer answers, self-preference for its own model family, vague rubrics, and the judge being wrong or injected by the output. Mitigations: swap orders, specific rubrics with anchored scales, a different judge model, reasoning before verdict, and calibration against human labels.

**How big does an eval set need to be?**
Big enough to detect the regressions you care about on each slice, which is usually tens to a few hundred cases, not thousands. Start with ten from real traffic on day one and grow it from every production failure.

**Why not just test the prompt manually?**
Manual checks cover one case at a time and are not repeatable, so a fix for one input silently breaks others and model upgrades cannot be validated. An automated set in CI makes prompt and model changes as safe as any other code change.

**How do you handle the non-determinism of outputs in a test suite?**
Grade on properties rather than exact strings where possible, run each case several times and compare pass rates, and set thresholds with a tolerance band. Flaky single-run gates get ignored by the team within a week.

**How do you evaluate an agent rather than a single prompt?**
Grade the end state (did the ticket get the right label, does the code pass tests) plus trace properties: number of steps, tool errors, forbidden actions, and cost. Keep a sandboxed environment so tool side effects are reproducible.

**What do you track in production that offline evals miss?**
Prompt and model versions per request, token usage and latency distributions, tool-call failure rates, user feedback and retry or escalation signals, and a sampled judge score over time. New failures feed back into the offline set.
