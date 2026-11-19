---
title: RAG Evaluation and Failure Modes
order: 2
summary: Retrieval metrics (recall@k, MRR), answer metrics (faithfulness, relevance), building a golden set, and the fix for each common RAG failure.
---

"How do you know it works?" is the question that separates people who shipped a demo from people who shipped a product. A RAG system has two subsystems that fail independently, so evaluate them separately: retrieval (did the right chunks come back?) and generation (did the model answer from them?).

## Two layers, two sets of metrics

```text
question --> retrieval --> chunks --> generation --> answer
              |                          |
       retrieval metrics           answer metrics
       (needs labelled chunks)     (needs reference answers or a judge)
```

Debug retrieval first. If the right chunk is not in the top-k, no prompt will save the answer.

## Retrieval metrics

Given a question and the set of chunks that actually answer it:

| Metric | What it measures | Formula / note |
|---|---|---|
| Recall@k | Fraction of relevant chunks present in the top k | relevant-in-top-k / total-relevant. The one that matters most; the model can ignore noise but cannot use what it never saw |
| Precision@k | Fraction of the top k that are relevant | relevant-in-top-k / k. Drives prompt size and distraction |
| MRR | How high the first relevant chunk ranks | mean of 1 / rank-of-first-hit. Good for single-answer questions |
| nDCG@k | Rank quality with graded relevance | Use when some chunks are "partially relevant" |
| Hit rate@k | Did any relevant chunk make it | binary recall; simplest to label |

```ts
function recallAtK(retrieved: string[], relevant: Set<string>, k: number): number {
  const hits = retrieved.slice(0, k).filter((id) => relevant.has(id)).length
  return relevant.size === 0 ? 0 : hits / relevant.size
}

function mrr(retrieved: string[], relevant: Set<string>): number {
  const i = retrieved.findIndex((id) => relevant.has(id))
  return i === -1 ? 0 : 1 / (i + 1)
}
```

Report recall at the k you actually send to the model (if you pass 20 chunks, report recall@20) and at a smaller k to see ranking quality.

## Answer metrics

| Metric | Question it answers | How it is scored |
|---|---|---|
| Faithfulness (groundedness) | Is every claim supported by the retrieved context? | LLM judge checks each claim against the chunks; or NLI entailment; citations make this checkable per span |
| Answer relevance | Does it answer the question asked? | Judge against the question, not the reference |
| Correctness | Does it match the reference answer? | Exact match for short facts; judge with a rubric for prose |
| Context relevance | Were the retrieved chunks about the question? | Judge per chunk; low values mean retrieval noise |
| Refusal correctness | Did it decline when the context lacked the answer? | Include unanswerable questions in the set; count false answers as the worst failure |

An LLM judge is acceptable in interviews if you say the caveats: calibrate it against a human-labelled sample, use a rubric with named criteria, prefer pairwise comparison for subjective quality, and never let the judge see which system produced the answer.

## Building a golden set

1. **Collect real questions**: from support tickets, search logs, sales calls; synthetic questions generated from chunks are a fallback and tend to be too easy because they reuse the chunk's wording.
2. **Label the evidence**: for each question, the chunk ids (or document plus span) that answer it. Two labellers plus adjudication on disagreements.
3. **Write a reference answer** where one exists; otherwise a rubric ("must mention the 30-day window, must not mention refunds").
4. **Include the hard cases**: unanswerable questions, questions needing two documents, questions with recent changes, questions that use different vocabulary from the docs, and questions whose answer the user is not allowed to see.
5. **Size**: 50 questions catches regressions; 200–500 gives stable metrics; stratify by topic and difficulty.
6. **Version it** alongside the index and the prompt, and rerun in CI on every change to chunking, embeddings, prompts or model.

Then run it: a script that executes retrieval for every question, records top-k ids, computes the metrics, generates answers, judges them, and writes one row per question so you can diff two runs.

```ts
type EvalCase = { id: string; question: string; relevantChunkIds: string[]; rubric?: string; answerable: boolean }
type EvalRow = { id: string; recallAt20: number; mrr: number; faithful: boolean; relevant: boolean; refusedCorrectly: boolean }

async function runEval(cases: EvalCase[], k = 20): Promise<EvalRow[]> {
  const rows: EvalRow[] = []
  for (const c of cases) {
    const retrieved = await retrieve(c.question, { k })           // ids in rank order
    const relevant = new Set(c.relevantChunkIds)
    const answer = await generate(c.question, retrieved)
    const verdict = await judge({ question: c.question, chunks: retrieved, answer, rubric: c.rubric })
    rows.push({
      id: c.id,
      recallAt20: recallAtK(retrieved.map((r) => r.id), relevant, k),
      mrr: mrr(retrieved.map((r) => r.id), relevant),
      faithful: verdict.faithful,
      relevant: verdict.relevant,
      refusedCorrectly: !c.answerable ? verdict.refused : true,
    })
  }
  return rows
}
```

Gate the pipeline on aggregates (mean recall@20 above a floor, faithfulness not dropping more than a point) and keep the per-row file as an artefact so a regression can be traced to specific questions.

## Reading the numbers

- Recall high, faithfulness low: generation problem. Tighten the prompt, add citations, reduce k so the model is less distracted.
- Recall low, MRR fine on the hits: coverage problem. Check chunking of the missed documents and whether the index is stale.
- Recall low across the board: query mismatch or embedding problem. Try hybrid search and query rewriting before touching the model.
- Metrics fine, users unhappy: the set does not represent real traffic. Mine production questions.

## Failure modes and their fixes

| Failure | How it shows up | Fix |
|---|---|---|
| **Wrong chunking** | Recall is low; the answer spans a boundary; tables and code are broken | Split on structure, add overlap, use parent-child chunks, keep heading path in the chunk |
| **Stale index** | Correct answer for last month's policy | Event-driven reindex on document change; `updated_at` on chunks; delete-then-insert per document; alert when index lag exceeds a bound |
| **Lost in the middle** | Right chunk retrieved but ignored; quality drops as k grows | Rerank so the best chunks sit first (and last); send fewer, better chunks; put the question after the context |
| **Query mismatch** | Users ask "can't log in", docs say "authentication failure" | Hybrid search, query rewriting, HyDE or multi-query, contextual chunk descriptions, synonyms in BM25 |
| **Permission leaks** | Answer quotes a document the user cannot open | Filter by ACL inside retrieval, resolve identity server-side, propagate revocations, add permission tests to the golden set |
| **Low precision** | Prompt stuffed with near-duplicates; cost up, answers waffle | Dedupe by document, rerank, cap chunks per document, raise the similarity floor |
| **Unanswerable but answered** | Confident fabrication when context is empty | Instruct to abstain, require citations, verify claims, return a "no sources found" state in the UI |
| **Conversation drift** | Follow-up retrieves for the literal last message | Rewrite the query using recent turns before embedding |
| **Embedding drift** | Metrics fall after a model upgrade | Never mix vectors from two models; re-embed everything; A/B the new index on the golden set before cutover |
| **Multi-hop questions** | Each chunk has half the answer | Iterative retrieval (retrieve, read, retrieve again) or an agentic loop with a search tool |
| **Over-long context** | Latency and cost grow; precision drops | Budget tokens per request; trim to top-k after rerank; prompt-cache the stable prefix |

## Observability for a RAG system in production

Log per request: the rewritten query, retrieved chunk ids with scores, which ids were cited in the answer, token counts, latency per stage, and user feedback. From these you get "cited rate" (how often retrieved chunks were actually used), empty-retrieval rate, and the questions with thumbs-down to feed back into the golden set. Sample conversations for human review weekly; the golden set only tells you about questions you already thought of.

## Worked example: diagnosing a bad answer

A user reports: "The assistant said our refund window is 14 days. It's 30." Debug it layer by layer using the trace for that request:

1. **Was the right document in the index?** Search the index directly for "refund window": the current policy (30 days) and an archived 2022 policy (14 days) are both there. **Finding: stale content indexed.**
2. **Was it retrieved?** The trace shows the top 6 reranked chunks: the archived policy ranks 1st, the current one 9th, so it never reached the model. **Retrieval failure.**
3. **Did the model use what it was given?** It answered faithfully from the archived chunk. **Generation was fine**; the context was wrong.

Fixes, in order: remove or flag archived documents (a `status = current` filter), add `updated_at` to chunks and boost recency for policy content, and add this question to the golden set so it can't regress.

The general rule: classify every failure before fixing it.

| Symptom | Likely layer | Check |
| --- | --- | --- |
| Right answer exists, not retrieved | Retrieval | Recall@k for the query; query rewriting; chunking |
| Retrieved, but the answer ignores it | Generation | Prompt instructions; context order; too many chunks |
| Answer contradicts the retrieved text | Generation (hallucination) | Groundedness check; ask for citations |
| Answer from content the user shouldn't see | Access control | Retrieval filters |
| Outdated answer | Ingestion | Freshness, versioning, re-indexing |
| "I don't know" when the answer exists | Retrieval or overly strict prompt | Recall@k; abstention instructions |

## A minimal evaluation loop in code

```ts
type Case = { question: string; relevantDocIds: string[]; referenceAnswer: string }

async function evaluate(cases: Case[]) {
  let recallHits = 0
  let grounded = 0
  for (const c of cases) {
    const retrieved = await retrieve(c.question, { k: 6 })
    if (c.relevantDocIds.some((id) => retrieved.some((r) => r.docId === id))) recallHits++

    const answer = await generate(c.question, retrieved)
    const verdict = await judge({
      rubric: 'Is every claim in the answer supported by the provided documents? Answer yes or no, then explain.',
      documents: retrieved,
      answer,
    })
    if (verdict.supported) grounded++
  }
  return { recallAt6: recallHits / cases.length, groundedness: grounded / cases.length }
}
```

Run it on every change to chunking, embeddings, retrieval parameters, prompts or models, and compare against the last baseline.

## Common interview questions

**Which metric would you look at first?**
Recall@k at the k you pass to the model. If the evidence is not in the prompt, no generation metric can be good, and recall isolates the retrieval stage so a regression is attributable.

**How do you evaluate answers without a human reading every one?**
An LLM judge with a rubric, calibrated on a human-labelled sample so you know its agreement rate, checking faithfulness against the retrieved chunks and relevance against the question. Keep a small human-reviewed sample running continuously to catch judge drift.

**What is "lost in the middle" and what do you do about it?**
Models attend less reliably to content buried in the middle of a long context, so a correct chunk at position 12 of 20 may be ignored. Rerank so the strongest evidence is first, pass fewer chunks, and place the question after the context.

**How do you catch a stale index?**
Track index lag: the time between a document change and its chunks being updated. Emit it as a metric, alert on it, and include questions about recently changed documents in the golden set.

**How would you test that permissions are enforced?**
Add golden-set cases where the asking user lacks access to the only document with the answer; the expected result is a refusal with no leaked content. Run them in CI and also as a canary against production with test identities.

**Users say the answers are wrong but the metrics look fine. What now?**
The golden set does not cover what users actually ask. Pull the thumbs-down conversations, classify the failures (retrieval miss, bad chunk, judge disagreement, unanswerable), add them to the set, and fix the largest bucket first.

**What is faithfulness and why is it separate from correctness?**
Faithfulness checks that the answer is supported by the retrieved context; correctness checks it matches the truth. An answer can be faithful to a stale document and wrong, or correct from memory and unfaithful, and they need different fixes.

## Pitfalls

- Judging a RAG system only by end-to-end answer quality, which hides where failures happen.
- Golden sets written by the team instead of drawn from real user questions.
- Ignoring stale or duplicate documents in the index.
- Uncalibrated LLM judges.

## Key takeaways

- Evaluate retrieval (recall@k, precision, MRR) and answers (groundedness, correctness, completeness) separately.
- Build a golden set from real questions with labelled relevant documents.
- Diagnose failures by layer: ingestion, retrieval, generation, access control.
- Trace every request so you can see what was retrieved and why.
- Add every production failure to the golden set to prevent regressions.
