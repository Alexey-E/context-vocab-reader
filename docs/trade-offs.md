# Trade-offs and Architecture Decisions

This document records deliberate decisions made for the MVP. These decisions can be revisited when usage, scale, or product requirements change.

## 1. Sentence translations are not stored persistently

### Decision

Sentence and paragraph translations are requested on demand and are not stored as permanent user content.

### Why

The main persistent learning artifact is the vocabulary card, not a translation history. Storing every sentence translation would add database growth, synchronization rules, invalidation concerns, and extra product complexity without improving the core learning flow.

### Consequence

Previously translated sentences may need to be translated again after the short-lived cache expires.

## 2. Short-lived cache is used for responsiveness and cost control

### Decision

Translation responses may be kept in a short-lived cache keyed by normalized text, source language, target language, and provider.

### Why

The cache avoids duplicate provider requests during an active reading flow. This improves responsiveness by removing repeated network latency and reduces unnecessary external API costs.

The cache is not a persistent translation history and does not change the decision not to store sentence translations as user data.

### Initial implementation

The first implementation can use an in-memory cache with a short TTL.

### Limitation

Memory is not shared reliably between serverless instances. A distributed cache can be introduced later if real usage demonstrates the need.

## 3. Paragraphs and sentences are derived from document content

### Decision

The MVP stores the original document content rather than creating separate paragraph, sentence, and word-occurrence tables.

### Why

These structures are derived views of the text. Persisting them immediately would increase schema complexity and introduce synchronization problems whenever document content changes.

### Consequence

Text splitting and tokenization must be deterministic and tested.

## 4. Vocabulary cards are persistent learning data

### Decision

Words explicitly saved by the user are stored as vocabulary cards.

### Why

Saving a word is an intentional user action and creates durable learning value.

### Stored context

A card may include `usage_context`: a sentence or fragment showing how the word was used when encountered.

This field is supporting context, not the source of truth for the translation.

## 5. Vocabulary card uniqueness includes the language pair

### Decision

The MVP keeps one card for each user, normalized word, source language, and target language combination. Multiple meanings within that combination are stored in the card's translation array.

### Why

The same normalized spelling can represent unrelated words in different source languages. A user may also translate the same source word into different target languages. Including both languages prevents those cards and their meanings from being merged.

### Consequence

Card lookup, duplicate detection, reader highlighting, and translation merging must always include the source and target language identifiers.

## 6. Images are external URLs only

### Decision

Vocabulary cards can reference external image URLs. The MVP does not upload images or use Supabase Storage.

### Why

Image upload introduces storage, processing, moderation, security, and lifecycle concerns that are not central to the MVP.

### Consequence

External images may become unavailable. The UI must show a fallback without deleting or invalidating the vocabulary card.

## 7. Translation providers are hidden behind an abstraction

### Decision

The UI and feature code depend on a translation-provider interface rather than Google Cloud Translation directly.

### Why

This supports a mock provider for safe public demos and tests, protects the application from provider-specific coupling, and makes cost-control strategies easier to change.

## 8. Translation runs on the server

### Decision

External translation calls are performed through Next.js server-side code.

### Why

Provider credentials must never be exposed to the browser. Server-side boundaries also centralize validation, caching, error mapping, timeouts, and logging.

## 9. Supabase RLS protects user-owned data

### Decision

Row Level Security is enabled for every user-owned table.

### Why

Client-side filtering is not a security boundary. RLS ensures that access rules are enforced by the database even if a client request is malformed or manipulated.

## 10. Database migrations are initially deployed manually

### Decision

Schema migrations are versioned in Git, validated locally, and initially applied to the remote Supabase project using an explicit manual command or workflow.

### Why

Database deployments are more difficult to reverse safely than application deployments. Manual promotion is appropriate while the schema is changing frequently.

## 11. Vercel handles application delivery

### Decision

Vercel provides preview deployments for branches and production deployments from `main`.

### Why

It integrates naturally with Next.js and GitHub and provides a simple separation between code validation and deployment.

## 12. The public demo may use a mock provider

### Decision

The public deployment can use `TRANSLATION_PROVIDER=mock` until external API quotas and abuse protection are configured.

### Why

A public portfolio URL should not expose an uncontrolled paid API endpoint.

## 13. Curated samples are separate from private documents

### Decision

Public demo texts are stored in a dedicated read-only `sample_documents` table. The `anon` and `authenticated` roles may read them, but neither role may create, update, or delete them. User documents and vocabulary cards remain private.

Demo visitors may choose a target language and request safe translations without creating an Auth user. An explicit Google or email/password sign-in is required before any document or vocabulary data is persisted.

### Why

A separate table makes the public API surface explicit and prevents public visibility rules from complicating private document policies. Requiring sign-in for persistence avoids temporary-account lifecycle and abuse concerns while keeping the read-and-translate demo frictionless.

## Review policy

A trade-off should be revisited when one of the following becomes true:

- real usage contradicts an assumption;
- the current decision creates a measurable UX problem;
- scale makes the implementation unreliable;
- a new requirement cannot be implemented cleanly;
- security or cost characteristics materially change.
