# Project Documentation

This directory contains the product and engineering decisions for Context Vocab Reader.

## Documents

- [Product scope](product-scope.md) — MVP user flow, included features, excluded features, persistent data, and temporary data.
- [Architecture](architecture.md) — application boundaries, request flows, server responsibilities, secrets, deployment, and security model.
- [Database model](database.md) — initial Supabase entities, relationships, constraints, indexes, and Row Level Security requirements.
- [Trade-offs](trade-offs.md) — deliberate architecture and product decisions, their rationale, consequences, and review conditions.
- [Implementation plan](implementation-plan.md) — staged delivery plan, acceptance criteria, and recommended pull-request sequence.
- [AI-assisted development](ai-usage.md) — permitted AI uses, human-owned decisions, review requirements, and transparency policy.

## Source of truth

Use the most specific document as the source of truth:

- scope questions → `product-scope.md`;
- system boundaries and data flow → `architecture.md`;
- schema and RLS → `database.md`;
- rationale for a decision → `trade-offs.md`;
- delivery order and progress → `implementation-plan.md`;
- AI workflow and review policy → `ai-usage.md`.

The root `README.md` remains the public project overview. These documents contain the detailed decisions behind it.

## Change policy

Documentation should be updated in the same pull request as the related implementation change.

Examples:

- adding a new MVP feature requires a scope update;
- changing where translation runs requires an architecture update;
- changing a table or policy requires a database update;
- reversing an earlier decision requires a trade-off update;
- completing or resequencing work requires an implementation-plan update.
