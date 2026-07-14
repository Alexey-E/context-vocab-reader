# Database Model

## Overview

Supabase PostgreSQL stores only persistent application data. Temporary sentence and paragraph translations are not stored as permanent records.

Initial entities:

```text
auth.users
  └─ profiles

profiles
  ├─ documents
  └─ vocabulary_cards

vocabulary_cards
  └─ review_events
```

## `profiles`

Stores application-level profile information that should not be read directly from `auth.users` throughout the codebase.

Suggested fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key; references `auth.users(id)` |
| `display_name` | `text` | Optional user-facing name |
| `avatar_url` | `text` | Optional OAuth avatar URL |
| `native_language` | `text` | Default target language preference |
| `learning_language` | `text` | Default source language preference |
| `created_at` | `timestamptz` | Creation time |
| `updated_at` | `timestamptz` | Last update time |

The profile row can be created after registration through a database trigger or an idempotent application operation.

## `documents`

Stores source texts created by the user.

Suggested fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `title` | `text` | Required |
| `content` | `text` | Original document text |
| `source_language` | `text` | Language of the source text |
| `target_language` | `text` | Translation language |
| `reading_position` | `integer` | Optional lightweight progress value |
| `created_at` | `timestamptz` | Creation time |
| `updated_at` | `timestamptz` | Last update time |

Paragraphs and sentences are derived from `content` and are not separate database rows in the MVP.

Recommended indexes:

- `documents(user_id, created_at desc)`

## `vocabulary_cards`

Stores words explicitly saved by a user.

Suggested fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `document_id` | `uuid` | Nullable reference to `documents(id)` |
| `word` | `text` | Original surface form |
| `normalized_word` | `text` | Normalized lookup value |
| `translation` | `text` | User-visible translation |
| `usage_context` | `text` | Optional sentence or fragment showing usage |
| `image_url` | `text` | Optional external HTTP(S) URL |
| `note` | `text` | Optional user note |
| `status` | `text` | `new`, `learning`, or `known` |
| `next_review_at` | `timestamptz` | Optional next review time |
| `created_at` | `timestamptz` | Creation time |
| `updated_at` | `timestamptz` | Last update time |

`usage_context` is supporting learning context. It is not the source of truth for the translation.

Recommended indexes:

- `vocabulary_cards(user_id, created_at desc)`
- `vocabulary_cards(user_id, normalized_word)`
- `vocabulary_cards(user_id, status, next_review_at)`

### Duplicate strategy

The MVP should not enforce uniqueness only on `user_id + normalized_word`, because one word can have multiple meanings.

Initial behavior:

- query and display existing cards for the normalized word
- warn the user before saving a possible duplicate
- allow saving when the meaning or context is different

A stricter constraint can be introduced later after observing real usage.

## `review_events`

Stores an append-only history of vocabulary reviews.

Suggested fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users(id)` |
| `card_id` | `uuid` | References `vocabulary_cards(id)` |
| `result` | `text` | Initial values: `again`, `good`, `known` |
| `created_at` | `timestamptz` | Review time |

Recommended index:

- `review_events(card_id, created_at desc)`

## Deletion behavior

Recommended foreign-key behavior:

- deleting an auth user deletes their profile and owned records
- deleting a document does not delete vocabulary cards; `document_id` becomes `null`
- deleting a vocabulary card deletes its review events

This preserves learned vocabulary when the original document is removed.

## Row Level Security

RLS must be enabled on:

- `profiles`
- `documents`
- `vocabulary_cards`
- `review_events`

### Policy principle

A user can access a row only when:

```sql
auth.uid() = user_id
```

For `profiles`, the ownership check uses:

```sql
auth.uid() = id
```

Policies are required for:

- `select`
- `insert`
- `update`
- `delete`

Insert and update policies must use `with check` so that a user cannot assign a row to another user.

## Validation and constraints

Recommended constraints:

- non-empty document title
- non-empty document content
- non-empty vocabulary word
- non-empty normalized word
- non-empty translation
- allowed vocabulary status values
- allowed review result values
- `image_url` is null or begins with `http://` or `https://`

Application validation is still required even when the database has constraints.

## Translation cache

A `translation_cache` table is intentionally excluded from the initial schema.

The first implementation uses a short-lived technical cache at the server layer. A persistent or distributed cache should be introduced only if usage and deployment behavior justify its additional complexity.

## Migration plan

Suggested initial migrations:

```text
0001_initial_schema.sql
0002_row_level_security.sql
0003_review_events.sql
```

Exact timestamp-based filenames will be generated by Supabase CLI.

Every migration must be tested from a clean local database with:

```bash
supabase db reset
```

The schema must be reproducible from version-controlled migrations without manual dashboard changes.
