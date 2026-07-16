# Database Model

## Overview

Supabase PostgreSQL stores only persistent application data. Temporary sentence and paragraph translations are not stored as permanent records.

Authentication data is managed by Supabase Auth and is intentionally separated from application profile data.

Initial entities:

```text
auth.users
  ├─ auth.identities
  ├─ auth.sessions
  └─ public.profiles

public.profiles
  ├─ public.documents
  └─ public.vocabulary_cards
```

## Authentication data ownership

Supabase Auth is the source of truth for authentication-related data.

It manages:

- user email identities
- password credentials and password hashes
- OAuth identities
- access tokens
- refresh tokens
- active sessions
- email confirmation state
- password reset flows

These values must not be duplicated in `public.profiles`.

In particular, the application must not add the following columns to `profiles`:

```text
email
password
password_hash
password_salt
auth_token
access_token
refresh_token
```

The reasons are:

- email would have two competing sources of truth
- password hashes are security credentials managed internally by Supabase Auth
- access tokens expire frequently
- refresh tokens rotate
- one user may have multiple active sessions
- OAuth-only users may not have a password credential

Application code should retrieve the authenticated user's email and session through the Supabase Auth API rather than through the `profiles` table.

## `profiles`

Stores application-level profile information and user preferences that do not belong to the authentication system.

Suggested fields:

| Field               | Type          | Notes                                    |
| ------------------- | ------------- | ---------------------------------------- |
| `id`                | `uuid`        | Primary key; references `auth.users(id)` |
| `display_name`      | `varchar(30)` | Optional user-facing name                |
| `avatar_url`        | `text`        | Optional OAuth avatar URL                |
| `native_language`   | `varchar(10)` | Default target language preference       |
| `learning_language` | `varchar(10)` | Default source language preference       |
| `created_at`        | `timestamptz` | Creation time                            |
| `updated_at`        | `timestamptz` | Last update time                         |

The profile row can be created after registration through a database trigger or an idempotent application operation.

The relationship is one-to-one:

```text
auth.users.id = public.profiles.id
```

Deleting an auth user should delete the related profile through `on delete cascade`.

## `documents`

Stores source texts created by the user.

Suggested fields:

| Field              | Type          | Notes                               |
| ------------------ | ------------- | ----------------------------------- |
| `id`               | `uuid`        | Primary key                         |
| `user_id`          | `uuid`        | References `auth.users(id)`         |
| `title`            | `text`        | Required                            |
| `content`          | `text`        | Original document text              |
| `source_language`  | `varchar(10)` | Language of the source text         |
| `target_language`  | `varchar(10)` | Translation language                |
| `reading_position` | `integer`     | Optional lightweight progress value |
| `created_at`       | `timestamptz` | Creation time                       |
| `updated_at`       | `timestamptz` | Last update time                    |

Paragraphs and sentences are derived from `content` and are not separate database rows in the MVP.

Recommended indexes:

- `documents(user_id, created_at desc)`

## `vocabulary_cards`

Stores words explicitly saved by a user.

Suggested fields:

| Field             | Type          | Notes                                       |
| ----------------- | ------------- | ------------------------------------------- |
| `id`              | `uuid`        | Primary key                                 |
| `user_id`         | `uuid`        | References `auth.users(id)`                 |
| `word`            | `text`        | Normalized lookup value                     |
| `source_language` | `varchar(10)` | Language of the saved word                  |
| `target_language` | `varchar(10)` | Language of the translations                |
| `translation`     | `text[]`      | One or more user-visible meanings           |
| `usage_context`   | `text`        | Optional sentence or fragment showing usage |
| `image_url`       | `text`        | Optional external HTTP(S) URL               |
| `note`            | `text`        | Optional user note                          |
| `created_at`      | `timestamptz` | Creation time                               |
| `updated_at`      | `timestamptz` | Last update time                            |

`usage_context` is supporting learning context. It is not the source of truth for the translation.

Recommended indexes:

- `vocabulary_cards(user_id, created_at desc)`
- unique `vocabulary_cards(user_id, source_language, target_language, word)`

### Duplicate strategy

The MVP should keep a single vocabulary card for each `user_id + source_language + target_language + word` combination. `word` contains the normalized lookup value. Multiple meanings within the same language pair are stored as separate values in the `translation` array rather than as separate cards.

The language pair is part of the card identity. Identical normalized words in different source languages remain separate cards, and the same source word can have separate cards for different translation languages.

Initial behavior:

- accept meanings as a comma-separated value in the UI
- trim, validate, and convert the entered meanings into a `text[]` value before saving
- copy the document's normalized source and target language identifiers when saving from the reader
- query for an existing card with the same normalized word and language pair
- create a new card when none exists
- otherwise merge new meanings into the existing card without duplicating identical array values

The database should enforce uniqueness on `user_id + source_language + target_language + word`. Meaning comparison and array merging remain application-level responsibilities in the MVP.

## Deletion behavior

Recommended foreign-key behavior:

- deleting an auth user deletes their profile and owned records
- deleting a document does not affect vocabulary cards because they do not reference documents

This preserves learned vocabulary when the original document is removed.

## Row Level Security

RLS must be enabled on:

- `profiles`
- `documents`
- `vocabulary_cards`

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

RLS on public tables does not replace Supabase Auth session validation. The authenticated user identity is resolved from the validated JWT by Supabase.

## Validation and constraints

Recommended constraints:

- non-empty document title
- non-empty document content
- non-empty normalized `word`
- non-empty normalized `source_language` and `target_language`
- `translation` contains at least one non-empty value
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
```

Exact timestamp-based filenames will be generated by Supabase CLI.

Every migration must be tested from a clean local database with:

```bash
supabase db reset
```

The schema must be reproducible from version-controlled migrations without manual dashboard changes.
