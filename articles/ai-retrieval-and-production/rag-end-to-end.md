---
title: RAG End to End
order: 1
summary: When to use retrieval versus long context or fine-tuning, the ingest-to-answer pipeline, chunking, embeddings, vector and hybrid search, reranking, access control, contextual retrieval and citations.
---

"Design a feature that answers questions over our docs" is now a standard full-stack prompt. The interviewer wants to hear that you know retrieval is a search problem first and a model problem second, that you can name every stage of the pipeline and the failure mode of each, and that you treat access control and grounding as requirements rather than polish.

## RAG vs long context vs fine-tuning

| Need | Reach for | Why |
|---|---|---|
| Answer from a private, changing corpus | RAG | Fresh data without retraining; sources can be cited; per-user permissions enforced at query time |
| Corpus fits comfortably in the window (Anthropic's contextual-retrieval post uses roughly 200k tokens, about 500 pages, as the line) | Long context, with prompt caching | Simplest system; no index to keep in sync; caching makes the repeated prefix cheap |
| Change the model's style, format or a narrow skill | Fine-tuning | Teaches behaviour, not facts; a fine-tuned model still hallucinates facts it never saw |
| Facts that change weekly | Never fine-tuning | Retraining on every change is slow and expensive; put facts in retrieval |

The honest interview answer: start with long context plus caching, move to RAG when the corpus outgrows the window or when you need per-document permissions, and fine-tune only for behaviour you cannot get from prompting.

## The pipeline

```text
ingest -> parse/clean -> chunk -> embed -> index (vector + keyword)
                                                   |
query -> rewrite -> embed -> retrieve top-k (filtered by ACL) -> rerank -> build prompt -> generate with citations
```

Two paths with different cadences: the offline path (ingest to index) runs on document change; the online path runs per request and has a latency budget. Keep them decoupled with a queue so a reindex never blocks a user.

## Chunking

Chunks are the unit of retrieval, so a bad split caps answer quality before the model is involved.

| Strategy | Use when | Watch for |
|---|---|---|
| Fixed size with overlap (300–800 tokens, 10–20% overlap) | Unstructured prose, quick baseline | Splits mid-sentence or mid-table; overlap duplicates text in results |
| Structure-aware (headings, paragraphs, code blocks) | Docs, wikis, Markdown, code | Oversized sections need a secondary split |
| Semantic (split where topic shifts) | Long essays, transcripts | More expensive to compute; hard to explain in review |
| Parent-child (embed small, return the parent) | Precision retrieval but the model needs surrounding context | Two tables to keep in sync |

Rules of thumb interviewers accept: chunk by document structure first, cap size second; store the heading path and document title with every chunk; never split code blocks or tables; keep chunk size below what your embedding model handles well. Anthropic's contextual-retrieval experiment used 800-token chunks and found passing 20 chunks to the model beat 5 or 10.

## Embeddings

An embedding model maps text to a fixed-length vector so that semantically similar texts are close under cosine or dot-product distance. Points worth saying out loud:

- **Dimensions**: current general-purpose models default to 1024 dimensions and offer 256, 512 or 2048 (Voyage 4 family, per Anthropic's embeddings guide); smaller vectors are cheaper to store and search, with a small quality cost. Models trained with Matryoshka representation can be truncated to a shorter prefix and renormalised.
- **Providers**: Anthropic does not ship an embedding model and points to Voyage AI (by MongoDB); OpenAI, Cohere, Google and open-weight models (BGE, E5, Voyage's open `voyage-4-nano`) are the other usual answers. Pick on retrieval quality for your domain, latency, price and whether a self-hosted option matters.
- **Query vs document mode**: retrieval models often take an `input_type` of `query` or `document` and prepend different instructions; omitting it costs recall.
- **Normalisation**: if vectors are unit length, cosine similarity equals dot product and ranking by Euclidean distance gives the same order.
- **Changing models is a full reindex.** Vectors from two models live in different spaces and cannot be compared, so a model upgrade means re-embedding every chunk, usually into a second index that you swap in once validated. Budget for it; store the model name and version next to each vector.
- **Quantisation**: int8 or binary vectors cut storage 4x to 32x; use them for a first pass and rescore the candidates with full-precision vectors.

## Where to store vectors

| Option | Fits when | Trade-off |
|---|---|---|
| pgvector in Postgres | You already run Postgres; up to low millions of vectors; you want ACL joins and transactions | One database to operate; approximate indexes top out at 2,000 dimensions for `vector` (4,000 for `halfvec`) |
| Dedicated vector database (Pinecone, Weaviate, Qdrant, Milvus, Turbopuffer) | Tens of millions of vectors, multi-tenant namespaces, managed scaling | Another system to secure, pay for and keep consistent with the source of truth |
| Search engine with vectors (Elasticsearch, OpenSearch, Vespa) | You need BM25 and vectors in one query with rich filtering | Heavier to run; tuning two retrieval models |
| In-memory or SQLite-style (LanceDB, sqlite-vec) | Prototypes, edge, under 100k vectors | Not shared; rebuild on deploy |

pgvector specifics an interviewer may probe (from the project README): exact search by default; `hnsw` and `ivfflat` indexes trade recall for speed; distance operators are `<->` (L2), `<=>` (cosine), `<#>` (negative inner product); `hnsw.ef_search` (default 40) and `ivfflat.probes` (default 1) raise recall at query time; build an IVFFlat index only after loading data; filters are applied after an approximate index scan, so a selective `WHERE` can return fewer than `LIMIT` rows unless you enable iterative scans or use a partial index.

```sql
CREATE TABLE chunks (
  id bigserial PRIMARY KEY,
  doc_id text NOT NULL,
  tenant_id text NOT NULL,
  heading_path text,
  body text NOT NULL,
  embedding vector(1024),
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', body)) STORED
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX ON chunks USING gin (tsv);

-- vector candidates, filtered by tenant before ranking
SELECT id, body, 1 - (embedding <=> $1) AS score
FROM chunks WHERE tenant_id = $2
ORDER BY embedding <=> $1 LIMIT 50;
```

## Hybrid search: BM25 plus vectors

Dense vectors capture meaning but miss exact identifiers, error codes, product SKUs and rare words. Keyword search (BM25, or Postgres full-text search) nails those but misses paraphrases. Run both and merge with reciprocal rank fusion:

```ts
function rrf(rankings: string[][], k = 60): Map<string, number> {
  const scores = new Map<string, number>()
  for (const ranking of rankings) {
    ranking.forEach((id, rank) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank + 1))
    })
  }
  return scores // sort descending, take top N
}
```

Say why RRF and not score averaging: BM25 scores and cosine similarities live on different scales, and rank fusion needs no calibration.

## Reranking

Retrieval returns a generous candidate set (50–150); a cross-encoder reranker reads the query and each candidate together and produces a relevance score far better than embedding distance. Then you keep the top 10–20 for the prompt. Cost is per candidate, so it is the knob you turn when first-stage recall is fine but precision is not. Hosted rerankers (Voyage `rerank-3`, Cohere Rerank) or an LLM scoring pass are both acceptable answers; the LLM is more expensive and slower but needs no extra vendor.

## Metadata filters and access control

Permissions are a retrieval-time requirement, not a post-filter:

- Store `tenant_id`, `owner`, `allowed_groups`, `visibility` and `updated_at` on every chunk, copied from the source system at ingest.
- Filter **before** ranking (a `WHERE` clause, a namespace, or the vector store's metadata filter). Filtering the top 10 after the fact leaks the existence of documents and often returns an empty list.
- Resolve the caller's identity on the server; never trust a client-supplied `userId` or document list.
- Revocation must propagate: on permission change, update the chunk metadata or delete the chunks, and bound the delay (the interviewer will ask "what if someone loses access?").
- Beware approximate-index filtering: a very selective filter on an HNSW index can under-return; pgvector's iterative scans, partial indexes or a per-tenant index solve it.

## Contextual retrieval

Chunks lose their surroundings: "the revenue grew 3%" means nothing without knowing which company and quarter. Anthropic's contextual-retrieval method asks a small model to write a 50–100 token description of each chunk in the context of its whole document, prepends it to the chunk before embedding and before building the BM25 index. Reported results on their benchmark (top-20 retrieval): failure rate down 35% with contextual embeddings alone, 49% with contextual BM25 added, 67% with reranking on top. Prompt caching makes it affordable because the full document is cached once and reused across every chunk's contextualisation call; their estimate was about one dollar per million document tokens. A related option is a contextualised chunk embedding model (such as `voyage-context-4`), which encodes chunks with document-level context without the extra generation step.

## Grounding and citations

Grounding means the answer is supported by the retrieved text and the user can check it. Three levels:

1. **Prompt-level**: number the chunks, instruct the model to cite `[n]` and to say when the context does not contain the answer. Cheap; the model can still invent a reference.
2. **API-level citations**: pass sources as `document` blocks with `citations: {enabled: true}`; the response interleaves text blocks with a `citations` array whose entries carry `cited_text`, `document_index` and a location (`char_location` for plain text, `page_location` for PDFs, `content_block_location` for custom content). Plain text and PDFs are split into sentences automatically; custom content lets you define the citable units yourself, which suits RAG chunks. Cited text does not count toward output tokens, and citations are incompatible with structured outputs (JSON mode), so choose one per request.
3. **Post-hoc verification**: a second call or a cheap NLI check that each claim is entailed by a cited chunk; flag or drop unsupported claims.

In the UI, render citations as links to the source chunk with the cited span highlighted; it is the single biggest trust feature of a RAG product.

## Query-side improvements worth naming

- **Query rewriting**: resolve pronouns and references from the conversation ("what about the EU version?") into a standalone query before embedding.
- **HyDE / multi-query**: generate a hypothetical answer or several rephrasings and retrieve for each; helps when questions and documents use different vocabulary.
- **Routing**: classify whether retrieval is needed at all; chit-chat and follow-ups about the last answer should not hit the index.
- **Freshness**: a `updated_at` boost or filter when the question implies recency.

## Worked example: one question through the pipeline

An employee asks the internal assistant: *"How many days of parental leave do I get in Germany?"*

| Step | What happens | Output |
| --- | --- | --- |
| 1. Query understanding | A small model rewrites the question for search and extracts a filter | Query "parental leave entitlement days Germany"; filter `country = DE` |
| 2. Access control | The user's groups are added as a filter | `visible_to ∈ {all-staff, de-employees}` |
| 3. Hybrid retrieval | BM25 and vector search each return 50 chunks; results merged with reciprocal rank fusion | 80 unique candidates |
| 4. Reranking | A cross-encoder scores each candidate against the query | Top 6 chunks, including "Germany benefits § 4.2 Parental leave" |
| 5. Context assembly | Chunks inserted with ids, titles and dates inside `<document>` tags | ~3,500 tokens |
| 6. Generation | The model answers using only the documents and cites ids | "You're entitled to … [doc-4.2]" |
| 7. Post-checks | Citations must point to provided documents; if none support an answer, say so | Answer with a link to the policy |

Why each step earns its place:

- **Filters before ranking** stop documents the user can't see from ever reaching the model, which is the only reliable way to enforce permissions in RAG.
- **Hybrid search** catches both exact terms ("§ 4.2", product codes) that embeddings miss, and paraphrases ("time off after having a baby") that keyword search misses.
- **Reranking** is where most precision comes from: a cross-encoder reads query and chunk together, unlike the embedding comparison.
- **Citations** let users verify the answer and let you measure groundedness.

If the policy changed last month, freshness metadata (an `updated_at` field and re-indexing on change) decides whether the old or new version is retrieved; storing a version per document and filtering to the current one avoids mixing them.

## Chunking, compared

| Strategy | How | Good for |
| --- | --- | --- |
| Fixed size with overlap | 500–1,000 tokens, 10–20% overlap | Uniform text, a quick baseline |
| Structure-aware | Split on headings, sections, list items | Documentation, policies, wikis |
| Semantic | Split where embedding similarity between sentences drops | Long unstructured prose |
| Parent–child | Retrieve small chunks, return their larger parent section | Precise matching with enough context |
| Contextual | Prepend a short generated summary of the document to each chunk before embedding | Chunks that are ambiguous out of context ("this applies to…") |

Start with structure-aware chunks plus titles in each chunk, measure retrieval recall, and only then try fancier strategies.

## Common interview questions

**Why not just put every document in the context window?**
If the corpus fits with room to spare, that is the right first design, and prompt caching makes the repeated prefix cheap. It stops working when the corpus outgrows the window, when documents have different permissions per user, or when per-request cost and latency scale with corpus size rather than with the question.

**How do you pick a chunk size?**
Split on document structure first so chunks are self-contained, then cap at a few hundred to about 800 tokens. Measure recall@k on a golden set with two or three sizes rather than guessing; the right size depends on how specific the questions are.

**What breaks if you switch embedding models?**
Every stored vector becomes incomparable with new query vectors, so you must re-embed the whole corpus into a new index, validate it against the eval set, and cut over atomically. Record the model version with each vector so a partial migration is detectable.

**Why hybrid search?**
Dense retrieval misses exact tokens such as error codes, names and IDs; keyword search misses paraphrase. Fusing both with reciprocal rank fusion gets the union of their strengths without having to calibrate scores on different scales.

**Where do permissions go?**
On the chunk metadata, filtered inside the retrieval query before ranking, with the caller's identity resolved server-side. Post-filtering the top-k leaks document existence and can return nothing when most candidates are forbidden.

**What is a reranker and when is it worth it?**
A cross-encoder that scores query and candidate together, more accurate than embedding distance but linear in the number of candidates. Use it when first-stage recall is good but the top-k is noisy, typically reranking 50–150 candidates down to 10–20.

**How do you stop the model from making up sources?**
Use API citations that bind each claim to a verified span in a supplied document, instruct the model to say when the context lacks the answer, and verify claims against cited chunks in a cheap second pass. Show the source in the UI so the user can check.

**What does contextual retrieval fix?**
Chunks lose the document-level context needed to match a query, such as which product or period they describe. Prepending a short generated description before embedding and indexing restores it, and cached document prefixes keep the one-time cost low.

## Pitfalls

- Embedding whole documents or tiny fragments without context.
- Vector search alone for queries with codes, names or exact phrases.
- Filtering permissions after generation instead of at retrieval.
- Stuffing dozens of chunks into the prompt instead of reranking to a few.
- No re-indexing when source documents change.

## Key takeaways

- RAG = retrieve relevant, permitted content, then generate a grounded, cited answer.
- Chunk by document structure, keep titles and metadata with each chunk.
- Use hybrid search (keywords plus vectors) and a reranker for precision.
- Enforce access control as retrieval filters, before anything reaches the model.
- Measure retrieval and answer quality separately; fix retrieval first.
